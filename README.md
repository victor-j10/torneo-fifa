# FIFA Torneo

Gestor de torneos FIFA **1v1** en el navegador. Sin backend ni base de datos: todo se guarda en `localStorage`.

## Funciones

- Crear torneos y registrar jugadores
- Fase de grupos (asignación, calendario round-robin, resultados)
- Clasificación automática (puntos, diferencia de goles, desempate directo)
- Calendario por jornada con filtros
- Playoffs eliminatorios con avance automático de ganadores
- Exportar / importar torneo en JSON

## Requisitos

- Node.js 18+

## Instalación

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |
| `npm test` | Tests unitarios (Vitest) |

## Flujo recomendado

1. Crear torneo y añadir jugadores (mín. 4)
2. Crear 2+ grupos y asignar jugadores
3. **Generar calendario** en la pestaña Grupos
4. Introducir resultados en Calendario
5. Revisar Clasificación
6. **Iniciar playoffs** cuando todos los partidos de grupo estén jugados
7. Completar el cuadro eliminatorio

## Stack

- Vite + React + TypeScript
- Zustand (estado + persistencia)
- Tailwind CSS v4
- React Router
