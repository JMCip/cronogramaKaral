import { Component, signal, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CronogramaService, Empleado } from './cronograma.service';
import { CalendarioComponent } from './calendario.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarioComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild('cronogramaContent') cronogramaContent!: ElementRef;

  private cronogramaService = inject(CronogramaService);

  protected nuevoEmpleado = signal('');
  protected empleados = this.cronogramaService.empleadosSignal;
  protected dias = this.cronogramaService.dias;
  protected diasCapitalizados = this.cronogramaService.diasCapitalizados;

  agregarEmpleado(): void {
    const nombre = this.nuevoEmpleado();
    if (nombre.trim()) {
      this.cronogramaService.agregarEmpleado(nombre);
      this.nuevoEmpleado.set('');
    }
  }

  agregarTurno(idEmpleado: number, dia: string, tipo: string): void {
    this.cronogramaService.agregarTurno(idEmpleado, dia, tipo);
  }

  eliminarTurno(idEmpleado: number, dia: string, tipo: string): void {
    this.cronogramaService.eliminarTurno(idEmpleado, dia, tipo);
  }

  eliminarEmpleado(idEmpleado: number): void {
    this.cronogramaService.eliminarEmpleado(idEmpleado);
  }

  descargarJSON(): void {
    const dataStr = this.cronogramaService.exportarJSON();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cronograma_completo.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  cargarJSON(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const datos = JSON.parse(e.target?.result as string);
          this.cronogramaService.importarJSON(datos);
        } catch (error) {
          alert('Error al importar el archivo');
        }
      };
      reader.readAsText(file);
    }
  }

  async descargarPDF(): Promise<void> {
    try {
      const html2canvas = (await import('html2canvas')).default as any;
      const { jsPDF } = (await import('jspdf')) as any;

      if (!this.cronogramaContent) {
        alert('Error: No se encontró el contenido del cronograma');
        return;
      }

      const element = this.cronogramaContent.nativeElement;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');

      let heightLeft = imgHeight;
      let position = 0;

      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save('cronograma_turnos.pdf');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el PDF. Intenta de nuevo.');
    }
  }

  obtenerHoras(tipo: string): string {
    return this.cronogramaService.obtenerHoras(tipo);
  }

  obtenerEmoji(tipo: string): string {
    return this.cronogramaService.obtenerEmoji(tipo);
  }

  obtenerTotalTurnos(empleado: Empleado): number {
    return Object.values(empleado.horarios).flat().length;
  }

  obtenerTurnosDia(empleado: Empleado): number {
    return Object.values(empleado.horarios)
      .flat()
      .filter(t => t === 'día').length;
  }

  obtenerTurnosNoche(empleado: Empleado): number {
    return Object.values(empleado.horarios)
      .flat()
      .filter(t => t === 'noche').length;
  }

  obtenerTurnosMedio(empleado: Empleado): number {
    return Object.values(empleado.horarios)
      .flat()
      .filter(t => t === 'medio').length;
  }

  obtenerTurnosDelDia(empleado: Empleado, dia: string): string[] {
    return empleado.horarios[dia] || [];
  }

  contarMedios(empleado: Empleado, dia: string): number {
    return (empleado.horarios[dia] || []).filter(t => t === 'medio').length;
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.agregarEmpleado();
    }
  }
}
