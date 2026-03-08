import { reactive } from 'vue';

// At the time of writing, the only parameter that is used by the application
// to understand which report to generate, is the part of the application path.
// Adding a whole router for just that seems like an overkill.
// When at some point in time there will be more complex routing required then
// adding vue-router would be preferable and would justify the increase in bundle
// size.

export function useParams() {
  const params = reactive({} as { id: string });

  const path = location.pathname.split('/');
  if (path.length === 3 && path[1] === 'dossier') {
    params.id = path[2];
  }

  return { params };
}
