
import { Injectable, Type, ApplicationRef, createComponent, EnvironmentInjector, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface DialogRef<T = any> {
  afterClosed(): Observable<T>;
  close(result?: T): void;
}

export interface DialogConfig<D = any> {
  data?: D;
  width?: string;
  height?: string;
  panelClass?: string | string[];
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogRefs = new Map<string, DialogRef>();
  private uniqueId = 0;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  open<T, D = any>(componentType: Type<T>, config?: DialogConfig<D>): DialogRef {
    const dialogId = `dialog-${this.uniqueId++}`;
    const closeSubject = new Subject<any>();
    
    // Crear contenedor para el diálogo
    const dialogContainer = document.createElement('div');
    dialogContainer.id = dialogId;
    dialogContainer.className = 'dialog-overlay fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50';
    document.body.appendChild(dialogContainer);
    
    // Crear una referencia al diálogo
    const dialogRef: DialogRef = {
      afterClosed: () => closeSubject.asObservable(),
      close: (result?: any) => {
        // Eliminar el diálogo del DOM cuando se cierra
        const container = document.getElementById(dialogId);
        if (container) {
          document.body.removeChild(container);
        }
        closeSubject.next(result);
        closeSubject.complete();
        this.dialogRefs.delete(dialogId);
      }
    };
    
    this.dialogRefs.set(dialogId, dialogRef);
    
    // Crear y montar el componente
    try {
      // Inyectar datos y dialogRef al componente
      const componentRef = createComponent(componentType, {
        environmentInjector: this.injector,
        hostElement: dialogContainer,
        elementInjector: undefined
      });
      
      // Pasar datos y dialogRef al componente
      if (componentRef.instance) {
        Object.assign(componentRef.instance, {
          dialogRef: dialogRef,
          data: config?.data || {}
        });
      }
      
      // Detectar cambios para actualizar la vista
      this.appRef.attachView(componentRef.hostView);
      
      // Agregar evento para cerrar con ESC o click fuera
      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          dialogRef.close();
          document.removeEventListener('keydown', handleEscKey);
        }
      };
      
      const handleOutsideClick = (event: MouseEvent) => {
        if (event.target === dialogContainer) {
          dialogRef.close();
          dialogContainer.removeEventListener('click', handleOutsideClick);
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      dialogContainer.addEventListener('click', handleOutsideClick);
      
    } catch (error) {
      console.error('Error al crear el componente de diálogo:', error);
      dialogRef.close();
    }
    
    return dialogRef;
  }
}