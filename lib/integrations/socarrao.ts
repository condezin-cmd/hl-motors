import "server-only";
import crypto from "node:crypto";

const API_BASE = "https://sc-api-prod.socarrao.com.br";
const ORIGIN = "sc-panel";
const PUBLIC_KEY = "q5Lh3X9fY2tP0dWbZ7nKjR1vUcHsEgQm";

type RequestOptions = {
  body?: unknown;
  params?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
};

export type SocarraoVehicle = {
  id: number;
  userId: number;
  categoryId: number;
  brandId: number;
  modelId: number;
  versionId: number;
  transmissionId: number | null;
  colorId: number | null;
  fuelId: number | null;
  priceType: string;
  price: number | null;
  conditionType: string;
  manufactureYear: number | null;
  modelYear: number | null;
  km: number | null;
  plate: string | null;
  chassi: string | null;
  description: string | null;
  status: string;
  brand?: { name?: string };
  model?: { name?: string };
  version?: { name?: string };
  transmission?: { name?: string };
  color?: { name?: string };
  fuel?: { name?: string };
  vehicleImages?: Array<{ url: string; position?: number }>;
  vehicleAccessories?: Array<{ accessory?: { name?: string } }>;
};

type SocarraoVehiclesResponse = {
  vehicles: SocarraoVehicle[];
  total?: number;
};

function stableHash(value: unknown) {
  const dispatch = (item: unknown): string => {
    if (item === null) return "Null";
    if (typeof item === "string") return `string:${item.length}:${item}`;
    if (typeof item === "number") return `number:${item}`;
    if (typeof item === "boolean") return `bool:${item}`;
    if (typeof item === "undefined") return "Undefined";
    if (Array.isArray(item)) return `array:${item.length}:${item.map(dispatch).join("")}`;
    if (typeof item === "object") {
      const object = item as Record<string, unknown>;
      const keys = Object.keys(object).sort();
      return `object:${keys.length}:${keys.map((key) => `${dispatch(key)}:${dispatch(object[key])},`).join("")}`;
    }
    return String(item);
  };

  return dispatch(value);
}

function securityDigest(value: unknown) {
  return crypto.createHash("sha256").update(stableHash(value), "utf8").digest("base64").slice(0, 10);
}

function decodeJwt<T = Record<string, any>>(token: string): T | null {
  try {
    const body = token.split(".")[1];
    return JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function queryString(params?: RequestOptions["params"]) {
  if (!params) return "";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

export class SocarraoClient {
  private accessToken?: string;
  private timeDiff?: number;

  constructor(
    private readonly options: {
      email?: string;
      password?: string;
      accessToken?: string;
      userId?: number;
      writeEnabled?: boolean;
    } = {},
  ) {
    this.accessToken = options.accessToken;
  }

  static fromEnv() {
    return new SocarraoClient({
      email: process.env.SOCARRAO_EMAIL,
      password: process.env.SOCARRAO_PASSWORD,
      accessToken: process.env.SOCARRAO_ACCESS_TOKEN,
      userId: process.env.SOCARRAO_USER_ID ? Number(process.env.SOCARRAO_USER_ID) : undefined,
      writeEnabled: process.env.SOCARRAO_WRITE_ENABLED === "true",
    });
  }

  private async syncTime() {
    if (typeof this.timeDiff === "number") return;
    const response = await fetch(`${API_BASE}/now`, {
      headers: { "x-sc-origin": ORIGIN },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`SóCarrão /now falhou (${response.status})`);
    const data = (await response.json()) as { epoch: number };
    this.timeDiff = data.epoch * 1000 - Date.now();
  }

  private async createSecurityHash() {
    await this.syncTime();
    const currentTime = Buffer.from(String(Date.now() + (this.timeDiff ?? 0))).toString("base64");
    const id = `${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`;
    return [id, currentTime, securityDigest({ id, currentTime, k: PUBLIC_KEY })].join(".");
  }

  private async ensureToken() {
    if (this.accessToken) return this.accessToken;
    if (!this.options.email || !this.options.password) {
      throw new Error("Configure SOCARRAO_EMAIL/SOCARRAO_PASSWORD ou SOCARRAO_ACCESS_TOKEN.");
    }

    const token = await this.request<{ access_token: string }>(
      "POST",
      "/accounts/auth/user/login",
      {
        body: { email: this.options.email, password: this.options.password },
      },
      false,
    );
    this.accessToken = token.access_token;
    return this.accessToken;
  }

  async request<T>(method: string, path: string, options: RequestOptions = {}, withAuth = true): Promise<T> {
    const headers: Record<string, string> = {
      "x-sc-origin": ORIGIN,
      "x-sc-key": await this.createSecurityHash(),
      ...options.headers,
    };

    if (withAuth) headers.authorization = `Bearer ${await this.ensureToken()}`;
    if (options.body !== undefined) headers["content-type"] = "application/json";

    const response = await fetch(`${API_BASE}${path}${queryString(options.params)}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`SóCarrão ${method} ${path} falhou (${response.status}): ${text.slice(0, 240)}`);
    }
    return text ? (JSON.parse(text) as T) : ({} as T);
  }

  async getUserId() {
    if (this.options.userId) return this.options.userId;
    const token = await this.ensureToken();
    const payload = decodeJwt<{ userPayload?: { userId?: number } }>(token);
    const userId = payload?.userPayload?.userId;
    if (!userId) throw new Error("Não foi possível identificar o userId do SóCarrão.");
    return userId;
  }

  async getVehicles(params: RequestOptions["params"] = { orderBy: "CREATED_DESC" }) {
    const userId = await this.getUserId();
    const all: SocarraoVehicle[] = [];
    let total = Infinity;
    for (let page = 1; page <= 50 && all.length < total; page++) {
      const res = await this.request<SocarraoVehiclesResponse>(
        "GET",
        `/accounts/user/${userId}/vehicles`,
        { params: { ...params, page } },
      );
      const batch = res.vehicles ?? [];
      all.push(...batch);
      total = typeof res.total === "number" ? res.total : all.length;
      if (batch.length === 0) break;
    }
    return { vehicles: all, total } as SocarraoVehiclesResponse;
  }

  async getSpecs() {
    const [categories, fuels, transmissions, bodyworks, accessories] = await Promise.all([
      this.request("GET", "/vehicles/category"),
      this.request("GET", "/vehicles/fuel"),
      this.request("GET", "/vehicles/transmission"),
      this.request("GET", "/vehicles/bodywork"),
      this.request("GET", "/vehicles/accessory"),
    ]);
    return { categories, fuels, transmissions, bodyworks, accessories };
  }

  async createVehicleDraft(payload: Record<string, unknown>) {
    if (!this.options.writeEnabled) {
      throw new Error("Publicação no SóCarrão bloqueada. Defina SOCARRAO_WRITE_ENABLED=true para liberar.");
    }
    return this.request("POST", "/vehicles", { body: payload });
  }
}

export function socarraoVehicleToVeiculo(vehicle: SocarraoVehicle) {
  const photos = [...(vehicle.vehicleImages ?? [])]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((image) => image.url)
    .filter(Boolean);

  const opcionais = (vehicle.vehicleAccessories ?? [])
    .map((item) => item.accessory?.name)
    .filter(Boolean);

  return {
    marca: vehicle.brand?.name ?? "",
    modelo: vehicle.model?.name ?? "",
    versao: vehicle.version?.name ?? null,
    ano_modelo: vehicle.modelYear,
    ano_fab: vehicle.manufactureYear,
    km: vehicle.km ?? 0,
    preco: vehicle.price ?? 0,
    cambio: vehicle.transmission?.name ?? null,
    combustivel: vehicle.fuel?.name ?? null,
    cor: vehicle.color?.name ?? null,
    placa: vehicle.plate ?? null,
    chassi: vehicle.chassi ?? null,
    status: vehicle.status === "ATIVO" ? "disponivel" : "inativo",
    descricao: vehicle.description ?? null,
    opcionais,
    fotos: photos,
    socarrao_id: vehicle.id,
    socarrao_status: vehicle.status,
    socarrao_last_sync_at: new Date().toISOString(),
    socarrao_payload: vehicle,
  };
}
