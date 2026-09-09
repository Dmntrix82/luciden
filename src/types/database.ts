export type Rol = "cliente" | "admin_db" | "admin_contenido";

export type Sexo = "Masculino" | "Femenino";

export type EstadoPago = "activo" | "pago_pendiente" | "desactivado";

export type TipoContenido = "texto" | "imagen" | "tipografia" | "color";

export type AccionHistorial = "creó" | "modificó" | "eliminó";

export type Perfil = {
  id: string;
  nombre_usuario: string | null;
  nombre_completo: string | null;
  rol: Rol;
  activo: boolean;
  created_at: string;
};

export type Estudiante = {
  id: string;
  codigo_estudiante: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombres: string;
  sexo: Sexo;
  fecha_nacimiento: string;
  cedula_identidad: string;
  fecha_inscripcion: string;
  fecha_inicio: string | null;
  fecha_final: string | null;
  curso: string | null;
  curso_id: string | null;
  estado_pago: EstadoPago;
  mensualidad: number;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type EstudianteTelefono = {
  id: string;
  estudiante_id: string;
  numero: string;
  etiqueta: string | null;
  created_at: string;
};

export type Docente = {
  id: string;
  nombres: string;
  direccion: string | null;
  carnet_identidad: string | null;
  celular: string | null;
  fecha_inicio: string | null;
  fecha_final: string | null;
  documento_cv: boolean;
  documento_carnet: boolean;
  documento_contrato: boolean;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
};

export type Curso = {
  id: string;
  nombre: string;
  docente_id: string | null;
  horario: string | null;
  informacion: string | null;
  imagen_url: string | null;
  fecha_inicio_clases: string | null;
  fecha_fin_clases: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type ContenidoPagina = {
  id: string;
  seccion: string;
  tipo: TipoContenido;
  clave: string;
  valor: string | null;
  updated_at: string;
  updated_by: string | null;
};

export type HistorialCambio = {
  id: string;
  tabla_modificada: string;
  registro_id: string;
  accion: AccionHistorial;
  campo_modificado: string | null;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  descripcion_legible: string;
  usuario_id: string | null;
  usuario_nombre: string | null;
  fecha_hora: string;
};

type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Tabla<Row, Insert, Update, Relationships extends GenericRelationship[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

export type Database = {
  public: {
    Tables: {
      perfiles: Tabla<
        Perfil,
        Pick<Perfil, "id"> & Partial<Omit<Perfil, "id">>,
        Partial<Omit<Perfil, "id">>
      >;
      estudiantes: Tabla<
        Estudiante,
        Omit<Estudiante, "id" | "created_at" | "updated_at" | "created_by" | "curso"> &
          Partial<Pick<Estudiante, "id" | "created_by" | "curso">>,
        Partial<Omit<Estudiante, "id" | "created_at" | "updated_at">>,
        [
          {
            foreignKeyName: "estudiantes_curso_id_fkey";
            columns: ["curso_id"];
            isOneToOne: false;
            referencedRelation: "cursos";
            referencedColumns: ["id"];
          },
        ]
      >;
      estudiante_telefonos: Tabla<
        EstudianteTelefono,
        Omit<EstudianteTelefono, "id" | "created_at" | "etiqueta"> &
          Partial<Pick<EstudianteTelefono, "id" | "etiqueta">>,
        Partial<Omit<EstudianteTelefono, "id">>
      >;
      docentes: Tabla<
        Docente,
        Omit<Docente, "id" | "created_at" | "updated_at"> & Partial<Pick<Docente, "id">>,
        Partial<Omit<Docente, "id" | "created_at" | "updated_at">>
      >;
      cursos: Tabla<
        Curso,
        Omit<Curso, "id" | "created_at" | "updated_at" | "imagen_url"> &
          Partial<Pick<Curso, "id" | "imagen_url">>,
        Partial<Omit<Curso, "id" | "created_at" | "updated_at">>,
        [
          {
            foreignKeyName: "cursos_docente_id_fkey";
            columns: ["docente_id"];
            isOneToOne: false;
            referencedRelation: "docentes";
            referencedColumns: ["id"];
          },
        ]
      >;
      contenido_pagina: Tabla<
        ContenidoPagina,
        Omit<ContenidoPagina, "id" | "updated_at" | "updated_by"> &
          Partial<Pick<ContenidoPagina, "id">>,
        Partial<Omit<ContenidoPagina, "id" | "updated_at" | "updated_by">>
      >;
      historial_cambios: Tabla<
        HistorialCambio,
        Omit<HistorialCambio, "id" | "fecha_hora"> & Partial<Pick<HistorialCambio, "id">>,
        Partial<Omit<HistorialCambio, "id">>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      nombre_usuario_disponible: {
        Args: { nombre: string };
        Returns: boolean;
      };
      correo_por_usuario: {
        Args: { p_usuario: string };
        Returns: string | null;
      };
      rol_actual: {
        Args: Record<string, never>;
        Returns: Rol | null;
      };
    };
  };
};
