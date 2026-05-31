import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CronogramaService, Empleado, TipoTurno } from './cronograma.service';

interface DiaCalendario {
  dia: string;
  fecha: number;
  empleados: Array<{
    nombre: string;
    turno: TipoTurno;
    horas: string;
  }>;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendario-container">
      <h2>📅 CALENDARIO DE TURNOS</h2>
      <p class="calendario-subtitle">Vista semanal de todos los turnos</p>

      <div class="calendar-grid">
        @for (dia of diasCalendario; track dia.dia; let idx = $index) {
          <div class="dia-card">
            <!-- Encabezado del día -->
            <div class="dia-card-header">
              <div class="dia-nombre">{{ dia.dia }}</div>
              <div class="dia-numero">{{ dia.fecha }}</div>
            </div>

            <!-- Contenido del día -->
            <div class="dia-card-content">
              @if (dia.empleados.length > 0) {
                <div class="empleados-list">
                  @for (empleado of dia.empleados; track $index) {
                    <div class="empleado-turno" [class]="'turno-' + empleado.turno">
                      <div class="empleado-info">
                        <span class="emoji">{{ getEmoji(empleado.turno) }}</span>
                        <span class="nombre">{{ empleado.nombre }}</span>
                      </div>
                      <div class="horas">{{ empleado.horas }}</div>
                    </div>
                  }
                </div>
              } @else {
                <div class="sin-turnos">
                  <span class="icon">🚫</span>
                  <p>Sin turnos</p>
                </div>
              }
            </div>

            <!-- Resumen del día -->
            <div class="dia-resumen">
              <span class="total">{{ dia.empleados.length }} turno<span *ngIf="dia.empleados.length !== 1">s</span></span>
            </div>
          </div>
        }
      </div>

      <!-- Leyenda -->
      <div class="calendario-legend">
        <h3>LEYENDA</h3>
        <div class="legend-items">
          <div class="legend-item turno-dia">
            <span>☀️</span> Turno Día (11:00-18:00)
          </div>
          <div class="legend-item turno-noche">
            <span>🌙</span> Turno Noche (18:00-22:00)
          </div>
          <div class="legend-item turno-medio">
            <span>⏰</span> Medio Turno (12:00-16:00)
          </div>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="calendario-stats">
        <h3>📊 ESTADÍSTICAS DE LA SEMANA</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ getTotalTurnos() }}</div>
            <div class="stat-label">Total Turnos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ getTotalEmpleados() }}</div>
            <div class="stat-label">Empleados</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ getTurnosDia() }}</div>
            <div class="stat-label">Turnos Día</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ getTurnosNoche() }}</div>
            <div class="stat-label">Turnos Noche</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ getTurnosMedio() }}</div>
            <div class="stat-label">Medios Turnos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ getDiaConMasTurnos().numero }}</div>
            <div class="stat-label">Máx en {{ getDiaConMasTurnos().dia }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendario-container {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 32px 24px;
      margin-top: 40px;
      margin-bottom: 60px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    }

    h2 {
      color: white;
      font-size: 28px;
      font-weight: 900;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .calendario-subtitle {
      color: #9ca3af;
      margin: 0 0 24px 0;
      font-size: 14px;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 40px;
    }

    .dia-card {
      background: #334155;
      border: 2px solid #475569;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }

    .dia-card:hover {
      border-color: #64748b;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      transform: translateY(-2px);
    }

    .dia-card-header {
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      padding: 16px;
      text-align: center;
      border-bottom: 2px solid #1d4ed8;
    }

    .dia-nombre {
      color: white;
      font-weight: 900;
      font-size: 14px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .dia-numero {
      color: rgba(255, 255, 255, 0.8);
      font-size: 24px;
      font-weight: 700;
      margin-top: 4px;
    }

    .dia-card-content {
      flex: 1;
      padding: 12px;
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empleados-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .empleado-turno {
      padding: 10px;
      border-radius: 8px;
      border: 2px solid;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: all 0.2s ease;
    }

    .empleado-turno:hover {
      transform: scale(1.05);
    }

    .empleado-turno.turno-día {
      background: #dbeafe;
      border-color: #60a5fa;
      color: #1e40af;
    }

    .empleado-turno.turno-noche {
      background: #e0e7ff;
      border-color: #818cf8;
      color: #3730a3;
    }

    .empleado-turno.turno-medio {
      background: #dcfce7;
      border-color: #22c55e;
      color: #166534;
    }

    .empleado-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      font-size: 13px;
    }

    .emoji {
      font-size: 16px;
    }

    .nombre {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .horas {
      font-size: 11px;
      opacity: 0.7;
      font-weight: 600;
    }

    .sin-turnos {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #94a3b8;
      text-align: center;
    }

    .sin-turnos .icon {
      font-size: 28px;
    }

    .sin-turnos p {
      margin: 0;
      font-size: 12px;
      font-weight: 600;
    }

    .dia-resumen {
      background: #2d3748;
      padding: 8px 12px;
      text-align: center;
      border-top: 1px solid #475569;
    }

    .total {
      color: #cbd5e1;
      font-size: 12px;
      font-weight: 600;
    }

    .calendario-legend {
      background: #2d3748;
      border: 1px solid #475569;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 32px;
    }

    .calendario-legend h3 {
      color: white;
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 700;
    }

    .legend-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      border-radius: 8px;
      border: 2px solid;
      font-weight: 600;
      font-size: 13px;
    }

    .legend-item span {
      font-size: 18px;
    }

    .legend-item.turno-dia {
      background: #dbeafe;
      border-color: #60a5fa;
      color: #1e40af;
      box-shadow: 0 4px 6px rgba(96, 165, 250, 0.2);
    }

    .legend-item.turno-noche {
      background: #e0e7ff;
      border-color: #818cf8;
      color: #3730a3;
      box-shadow: 0 4px 6px rgba(129, 140, 248, 0.2);
    }

    .legend-item.turno-medio {
      background: #dcfce7;
      border-color: #22c55e;
      color: #166534;
      box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2);
    }

    .calendario-stats {
      background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%);
      border: 1px solid #1e40af;
      border-radius: 12px;
      padding: 24px;
    }

    .calendario-stats h3 {
      color: white;
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 700;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .stat-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    .stat-number {
      color: #60a5fa;
      font-size: 32px;
      font-weight: 900;
      line-height: 1;
      margin-bottom: 8px;
    }

    .stat-label {
      color: #cbd5e1;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 768px) {
      .calendar-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .calendar-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      h2 {
        font-size: 22px;
      }
    }
  `]
})
export class CalendarioComponent {
  private cronogramaService = inject(CronogramaService);

  get diasCalendario(): DiaCalendario[] {
    const empleados = this.cronogramaService.obtenerEmpleados();
    const dias = this.cronogramaService.dias;
    const diasCapitalizados = this.cronogramaService.diasCapitalizados;

    return dias.map((dia, idx) => {
      const empleadosDia: Array<{
        nombre: string;
        turno: TipoTurno;
        horas: string;
      }> = [];

      empleados.forEach(emp => {
        emp.horarios[dia].forEach(turno => {
          empleadosDia.push({
            nombre: emp.nombre,
            turno: turno as TipoTurno,
            horas: this.cronogramaService.obtenerHoras(turno)
          });
        });
      });

      return {
        dia: diasCapitalizados[idx],
        fecha: idx + 1,
        empleados: empleadosDia
      };
    });
  }

  getEmoji(turno: TipoTurno): string {
    return this.cronogramaService.obtenerEmoji(turno);
  }

  getTotalTurnos(): number {
    return this.diasCalendario.reduce((total, dia) => total + dia.empleados.length, 0);
  }

  getTotalEmpleados(): number {
    const empleados = new Set(
      this.diasCalendario.flatMap(dia => dia.empleados.map(e => e.nombre))
    );
    return empleados.size;
  }

  getTurnosDia(): number {
    return this.diasCalendario.reduce(
      (total, dia) => total + dia.empleados.filter(e => e.turno === 'día').length,
      0
    );
  }

  getTurnosNoche(): number {
    return this.diasCalendario.reduce(
      (total, dia) => total + dia.empleados.filter(e => e.turno === 'noche').length,
      0
    );
  }

  getTurnosMedio(): number {
    return this.diasCalendario.reduce(
      (total, dia) => total + dia.empleados.filter(e => e.turno === 'medio').length,
      0
    );
  }

  getDiaConMasTurnos(): { dia: string; numero: number } {
    const dias = this.cronogramaService.diasCapitalizados;
    let maxTurnos = 0;
    let diaConMax = dias[0];

    this.diasCalendario.forEach((dia, idx) => {
      if (dia.empleados.length > maxTurnos) {
        maxTurnos = dia.empleados.length;
        diaConMax = dias[idx];
      }
    });

    return { dia: diaConMax.slice(0, 3), numero: maxTurnos };
  }
}
