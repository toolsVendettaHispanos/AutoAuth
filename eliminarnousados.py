
import os
import shutil
from datetime import datetime

# --- Configuración ---
UNUSED_COMPONENTS_FILE = 'nousados.txt'
BACKUP_BASE_DIR = 'backup_componentes_nousados'
# --- Fin Configuración ---

def main():
    """
    Función principal para respaldar y eliminar componentes no utilizados.
    """
    # Crear un directorio de respaldo único con fecha y hora
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    backup_dir = os.path.join(BACKUP_BASE_DIR, timestamp)
    
    try:
        os.makedirs(backup_dir, exist_ok=True)
        print(f"Directorio de respaldo creado en: {backup_dir}")
    except OSError as e:
        print(f"Error al crear el directorio de respaldo: {e}")
        return

    # Comprobar si el archivo de componentes no utilizados existe
    if not os.path.isfile(UNUSED_COMPONENTS_FILE):
        print(f"Error: El archivo '{UNUSED_COMPONENTS_FILE}' no se encontró.")
        return

    # Leer la lista de archivos a eliminar
    try:
        with open(UNUSED_COMPONENTS_FILE, 'r') as f:
            files_to_delete = [line.strip() for line in f if line.strip()]
    except IOError as e:
        print(f"Error al leer el archivo '{UNUSED_COMPONENTS_FILE}': {e}")
        return

    if not files_to_delete:
        print("El archivo de componentes no utilizados está vacío. No hay nada que hacer.")
        return

    print(f"\nSe procesarán {len(files_to_delete)} archivos...")
    
    deleted_count = 0
    not_found_count = 0

    # Procesar cada archivo
    for filepath in files_to_delete:
        # Asegurarse de que el path sea relativo al directorio actual si es necesario
        # En este caso, asumimos que los paths en nousados.txt son correctos desde la raíz del proyecto.
        if os.path.exists(filepath):
            try:
                # 1. Copiar al directorio de respaldo
                shutil.copy(filepath, backup_dir)
                
                # 2. Eliminar el archivo original
                os.remove(filepath)
                
                print(f"  [OK] '{filepath}' respaldado y eliminado.")
                deleted_count += 1
            except (shutil.Error, OSError) as e:
                print(f"  [ERROR] No se pudo procesar '{filepath}': {e}")
        else:
            print(f"  [AVISO] El archivo '{filepath}' no se encontró y fue omitido.")
            not_found_count += 1
    
    print("\n--- Proceso Finalizado ---")
    print(f"Archivos eliminados con éxito: {deleted_count}")
    print(f"Archivos no encontrados: {not_found_count}")
    print(f"Se ha guardado un respaldo en la carpeta '{backup_dir}'.")

if __name__ == "__main__":
    main()
