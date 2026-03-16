import { ref } from 'vue';

export function useCep() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchAddress = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return null;

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        error.value = 'CEP não encontrado';
        return null;
      }

      return {
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf
      };
    } catch (err) {
      error.value = 'Erro ao buscar CEP';
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    fetchAddress
  };
}
