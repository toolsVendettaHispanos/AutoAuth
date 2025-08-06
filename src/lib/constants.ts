
// /src/lib/constants.ts

// --- AUTH ---
export const SESSION_COOKIE_NAME = 'vendetta-session';
export const ADMIN_COOKIE_NAME = 'vendetta-admin-session';
export const SUPER_USER_COOKIE_NAME = 'vendetta-super-session';

// --- GAME RULES ---
export const MAX_CONSTRUCTION_QUEUE_SIZE = 5;
export const BASE_STORAGE_CAPACITY = 10000;
export const STORAGE_CAPACITY_PER_LEVEL = 150000;


// --- SPECIAL BUILDING IDs ---
export const ID_OFICINA_JEFE = 'oficina_del_jefe';
export const ID_ESCUELA_ESPECIALIZACION = 'escuela_especializacion';
export const ID_CAMPO_ENTRENAMIENTO = 'campo_de_entrenamiento';
export const ID_SEGURIDAD = 'seguridad';

// --- TROOP IDs ---
export const ID_TROPA_ESPIA = 'espia';
export const ID_TROPA_OCUPACION = 'ocupacion';

// --- TROOP TYPES ---
export const TROOP_TYPE_DEFENSE = 'DEFENSA';
export const TROOP_TYPE_ATTACK = 'ATAQUE';
export const TROOP_TYPE_TRANSPORT = 'TRANSPORTE';
export const TROOP_TYPE_SPY = 'ESPIONAJE';
export const TROOP_TYPE_OCCUPY = 'OCUPAR';

// --- MISSION TYPES ---
export const MISSION_TYPES_NO_RETURN = ['OCUPAR'];


// --- UI SORTING ---
export const RECRUITMENT_TROOP_ORDER = [
    "maton", "portero", "acuchillador", "pistolero", "ocupacion", "espia", "porteador", "cia", "fbi", "transportista", "tactico", "francotirador", "asesino", "ninja", "demoliciones", "mercenario"
];

export const SECURITY_TROOP_ORDER = ["trabajador_ilegal", "centinela", "policia", "guardaespaldas", "guardia_de_honor"];

export const TRAINING_ORDER = [
    "rutas", "encargos", "extorsion", "administracion", "contrabando", "espionaje", "seguridad",
    "proteccion", "combate", "armas", "tiro", "explosivos", "guerrilla", "psicologico", "quimico", "honor"
];

export const ROOM_ORDER = [
    'oficina_del_jefe', 'escuela_especializacion', 'armeria', 'almacen_de_municion',
    'cerveceria', 'taberna', 'contrabando', 'almacen_de_armas', 'deposito_de_municion',
    'almacen_de_alcohol', 'caja_fuerte', 'campo_de_entrenamiento', 'seguridad',
    'torreta_de_fuego_automatico', 'minas_ocultas'
];

// --- RESOURCES ---
export const resourceIcons: { [key: string]: string } = {
    armas: '/img/recursos/armas.svg',
    municion: '/img/recursos/municion.svg',
    alcohol: '/img/recursos/alcohol.svg',
    dolares: '/img/recursos/dolares.svg',
};
