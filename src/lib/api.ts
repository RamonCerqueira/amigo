// Utilitários para fazer requisições HTTP no frontend

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Função base para fazer requisições
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Erro na requisição',
        response.status,
        data.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Erro de rede ou parsing
    throw new ApiError('Erro de conexão', 0);
  }
}

// Funções específicas para autenticação
export const authApi = {
  // Registrar usuário
  async registro(dados: {
    email: string;
    password: string;
    confirmPassword: string;
    nomeAnonimo?: string;
    telefone: string;
    idade: number;
    endereco: string;
  }) {
    return apiRequest('/auth/registro', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  // Login
  async login(dados: { email: string; password: string }) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  // Verificar email
  async verificarEmail(dados: { email: string; codigo: string }) {
    return apiRequest('/auth/verificar-email', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  // Reenviar código de verificação
  async reenviarCodigo(email: string) {
    return apiRequest('/auth/verificar-email', {
      method: 'PUT',
      body: JSON.stringify({ email }),
    });
  },
};

// Funções para conversas
export const conversasApi = {
  // Buscar histórico
  async buscarHistorico(usuarioId: string, limite: number = 50) {
    return apiRequest(`/conversas?usuarioId=${usuarioId}&limite=${limite}`);
  },

  // Enviar mensagem
  async enviarMensagem(dados: {
    usuarioId: string;
    textoUsuario: string;
  }) {
    return apiRequest('/conversas', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },
};

// Funções para usuários
export const usuariosApi = {
  // Buscar dados do usuário
  async buscarPorId(id: string) {
    return apiRequest(`/usuarios/${id}`);
  },

  // Atualizar perfil
  async atualizarPerfil(id: string, dados: {
    nomeAnonimo?: string;
    telefone?: string;
    endereco?: string;
  }) {
    return apiRequest(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  },

  // Desativar conta
  async desativarConta(id: string) {
    return apiRequest(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  },
};

// Funções para dashboard
export const dashboardApi = {
  // Buscar dados do dashboard
  async buscarDados(usuarioId: string) {
    return apiRequest(`/dashboard?usuarioId=${usuarioId}`);
  },
};

// Hook personalizado para gerenciar estado de loading e erro
export function useApiState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Erro inesperado');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute, setError };
}

// Utilitário para tratamento de erros de formulário
export function handleFormErrors(
  error: ApiError,
  setFieldError: (field: string, message: string) => void
) {
  if (error.details) {
    error.details.forEach(({ field, message }) => {
      setFieldError(field, message);
    });
  } else {
    setFieldError('general', error.message);
  }
}

// Utilitário para localStorage (com tratamento de erro)
export const storage = {
  get(key: string) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignorar erro de storage
    }
  },

  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignorar erro de storage
    }
  },
};

export { ApiError };
