import { Injectable, signal } from '@angular/core';

export type TipoTurno = 'día' | 'noche' | 'medio';

export interface Turno {
  tipo: TipoTurno;
  hora?: string;
}

export interface Empleado {
  id: number;
  nombre: string;
  horarios: {
    [key: string]: TipoTurno[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class CronogramaService {
  private readonly STORAGE_KEY = 'cronograma_empleados';
  private readonly DEFAULT_EMPLEADOS: Empleado[] = [
    {
      id: 1,
      nombre: 'Juandi',
      horarios: {
        lunes: [],
        martes: ['día'],
        miercoles: [],
        jueves: [],
        viernes: ['día'],
        sabado: [],
        domingo: ['día']
      }
    },
    {
      id: 2,
      nombre: 'José',
      horarios: {
        lunes: ['día'],
        martes: [],
        miercoles: ['día'],
        jueves: ['día', 'noche'],
        viernes: [],
        sabado: ['día', 'noche'],
        domingo: []
      }
    },
    {
      id: 3,
      nombre: 'Samuel',
      horarios: {
        lunes: ['medio'],
        martes: [],
        miercoles: [],
        jueves: ['medio'],
        viernes: [],
        sabado: ['medio', 'medio'],
        domingo: ['medio']
      }
    }
  ];

  private empleados = signal<Empleado[]>(this.cargarDelStorage());

  public readonly empleadosSignal = this.empleados.asReadonly();
  public readonly dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  public readonly diasCapitalizados = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

  constructor() {}

  /**
   * Cargar datos del LocalStorage o retornar los datos por defecto
   */
  private cargarDelStorage(): Empleado[] {
    try {
      const datosGuardados = localStorage.getItem(this.STORAGE_KEY);
      if (datosGuardados) {
        return JSON.parse(datosGuardados);
      }
    } catch (error) {
      console.error('Error al cargar datos del localStorage:', error);
    }
    return JSON.parse(JSON.stringify(this.DEFAULT_EMPLEADOS));
  }

  /**
   * Guardar datos en LocalStorage
   */
  private guardarEnStorage(empleados: Empleado[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(empleados));
    } catch (error) {
      console.error('Error al guardar datos en localStorage:', error);
    }
  }

  agregarEmpleado(nombre: string): void {
    if (nombre.trim()) {
      const newId = Math.max(...this.empleados().map(e => e.id), 0) + 1;
      const horariosVacios: { [key: string]: TipoTurno[] } = {};
      this.dias.forEach(dia => {
        horariosVacios[dia] = [];
      });

      const nuevoEmpleado: Empleado = {
        id: newId,
        nombre: nombre.trim(),
        horarios: horariosVacios
      };

      this.empleados.update(empleados => {
        const nuevosEmpleados = [...empleados, nuevoEmpleado];
        this.guardarEnStorage(nuevosEmpleados);
        return nuevosEmpleados;
      });
    }
  }

  agregarTurno(idEmpleado: number, dia: string, tipo: string): void {
    this.empleados.update(empleados => {
      const nuevosEmpleados = empleados.map(emp =>
        emp.id === idEmpleado
          ? {
            ...emp,
            horarios: {
              ...emp.horarios,
              [dia]: !emp.horarios[dia].includes(tipo as any)
                ? [...emp.horarios[dia], tipo as any]
                : emp.horarios[dia]
            }
          }
          : emp
      );
      this.guardarEnStorage(nuevosEmpleados);
      return nuevosEmpleados;
    });
  }

  eliminarTurno(idEmpleado: number, dia: string, tipo: string): void {
    this.empleados.update(empleados => {
      const nuevosEmpleados = empleados.map(emp =>
        emp.id === idEmpleado
          ? {
            ...emp,
            horarios: {
              ...emp.horarios,
              [dia]: emp.horarios[dia].filter(t => t !== tipo)
            }
          }
          : emp
      );
      this.guardarEnStorage(nuevosEmpleados);
      return nuevosEmpleados;
    });
  }

  eliminarEmpleado(idEmpleado: number): void {
    this.empleados.update(empleados => {
      const nuevosEmpleados = empleados.filter(emp => emp.id !== idEmpleado);
      this.guardarEnStorage(nuevosEmpleados);
      return nuevosEmpleados;
    });
  }

  obtenerEmpleados(): Empleado[] {
    return this.empleados();
  }

  exportarJSON(): string {
    return JSON.stringify(this.empleados(), null, 2);
  }

  importarJSON(datos: Empleado[]): void {
    this.empleados.set(datos);
    this.guardarEnStorage(datos);
  }

  /**
   * Restaurar datos por defecto y limpiar el localStorage
   */
  restaurarDatosDefecto(): void {
    const datosDefecto = JSON.parse(JSON.stringify(this.DEFAULT_EMPLEADOS));
    this.empleados.set(datosDefecto);
    this.guardarEnStorage(datosDefecto);
  }

  /**
   * Limpiar todos los datos
   */
  limpiarTodo(): void {
    this.empleados.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  obtenerHoras(tipo: string): string {
    switch (tipo) {
      case 'día':
        return '11:00 - 18:00';
      case 'noche':
        return '18:00 - 22:00';
      case 'medio':
        return '12:00 - 16:00';
      default:
        return '';
    }
  }

  obtenerEmoji(tipo: string): string {
    switch (tipo) {
      case 'día':
        return '☀️';
      case 'noche':
        return '🌙';
      case 'medio':
        return '⏰';
      default:
        return '';
    }
  }
}
