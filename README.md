# FIFA Torneo

Gestor de torneos FIFA **1v1** en el navegador. Sin backend ni base de datos: todo se guarda en `localStorage`.

## Funciones

- Crear torneos y registrar jugadores
- Fase de grupos (asignación, calendario round-robin, resultados)
- Clasificación automática (puntos, diferencia de goles, desempate directo)
- Calendario por jornada con filtros
- Playoffs eliminatorios con avance automático de ganadores
- **Sorteo de equipos**: asignación aleatoria de los 10 mejores clubes de Europa a cada jugador
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
2. En **Sorteo equipos**, asignar club europeo a cada uno (Real Madrid, Barça, Liverpool…)
3. Crear 2+ grupos y asignar jugadores
4. **Generar calendario** en la pestaña Grupos
5. Introducir resultados en Calendario
6. Revisar Clasificación
7. **Iniciar playoffs** cuando todos los partidos de grupo estén jugados
8. Completar el cuadro eliminatorio

## Stack

- Vite + React + TypeScript
- Zustand (estado + persistencia)
- Tailwind CSS v4
- React Router
