# Componentes UI - Design System

## Badge Component

Componente reutilizável para exibir status e labels com cores semânticas.

### Uso Básico

```tsx
import { Badge } from '@/components/ui/Badge';

// Status de sucesso
<Badge variant="success">Completo</Badge>

// Status de aviso
<Badge variant="warning">Parcial</Badge>

// Status de erro
<Badge variant="error">Vazio</Badge>

// Status informativo
<Badge variant="info">Em análise</Badge>

// Badge padrão
<Badge variant="default">Padrão</Badge>
```

### Variantes Disponíveis

- `success` - Verde (para status completos/positivos)
- `warning` - Amarelo (para status parciais/atenção)
- `error` - Vermelho (para status vazios/erros)
- `info` - Azul (para informações)
- `default` - Cinza (padrão)

### Exemplo: Substituindo Emojis de Status

**Antes:**
```tsx
<span className="text-2xl">{status.emoji}</span>
```

**Depois:**
```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant={status.status === 'complete' ? 'success' : status.status === 'partial' ? 'warning' : 'error'}>
  {status.label}
</Badge>
```

### Customização

Você pode adicionar classes customizadas através da prop `className`:

```tsx
<Badge variant="success" className="px-4 py-1">
  Status Customizado
</Badge>
```
