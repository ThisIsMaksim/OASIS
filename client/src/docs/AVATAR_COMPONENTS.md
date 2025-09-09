# Компоненты для работы с аватарами

## AvatarEditor

Компонент для создания и редактирования аватара через Ready Player Me React компонент (не iframe).

### Использование

```tsx
import { AvatarEditor } from '../components/AvatarEditor';

function EditorPage() {
  const handleAvatarCreated = (avatarUrl: string) => {
    console.log('Аватар создан:', avatarUrl);
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <AvatarEditor onAvatarCreated={handleAvatarCreated} />
    </div>
  );
}
```

### Свойства

- `onAvatarCreated?: (avatarUrl: string) => void` - Callback, вызываемый при создании аватара

### Особенности

- Использует `@readyplayerme/react-avatar-creator` вместо iframe
- Автоматически сохраняет URL аватара в localStorage
- Обновляет состояние в Zustand store
- Редиректит на главную страницу после создания аватара
- Показывает индикатор загрузки с backdrop blur
- Использует конфигурацию из `../lib/rpm.ts`
- **Оптимизирован для мобильного веб**:
  - Использует `h-dvh` для правильной высоты на мобильных устройствах
  - Полноэкранный режим без отступов
  - Адаптивный индикатор загрузки

### Технические детали

- **Библиотека**: `@readyplayerme/react-avatar-creator`
- **Конфигурация**: Импортируется из `RPM_CONFIG` и `RPM_SUBDOMAIN`
- **События**: Обрабатывает `onAvatarExported` и `onUserSet`
- **Типизация**: Использует типы `AvatarExportedEvent` и `UserSetEvent`
- **Стили**: Использует `100dvh` для корректной работы на мобильных устройствах
- **Контейнер**: App.tsx автоматически применяет полноэкранный режим для `/editor`

### Мобильная оптимизация

- Высота контейнера: `h-dvh` (dynamic viewport height)
- Стили компонента: `height: '100dvh', minHeight: '100dvh'`
- Полноэкранный режим в App.tsx: `h-dvh w-full overflow-hidden`
- Индикатор загрузки с полупрозрачным фоном и blur эффектом

## AvatarViewer

Компонент для отображения аватара с анимациями, использует библиотеку @readyplayerme/visage.

### Использование

```tsx
import { AvatarViewer } from '../components/AvatarViewer';

function ViewerPage() {
  return (
    <div style={{ width: '400px', height: '600px' }}>
      <AvatarViewer 
        modelSrc="https://models.readyplayer.me/your-avatar-id.glb"
        onLoaded={() => console.log('Аватар загружен')}
        onLoading={() => console.log('Загрузка аватара')}
      />
    </div>
  );
}
```

### Свойства

- `modelSrc: string` - URL модели аватара (обязательно)
- `animationSrc?: string` - URL анимации (по умолчанию: male-idle.glb)
- `className?: string` - CSS класс для контейнера
- `style?: React.CSSProperties` - Inline стили
- `onLoaded?: () => void` - Callback при загрузке
- `onLoading?: () => void` - Callback при начале загрузки

### Предустановленные варианты

#### MaleAvatarViewer
```tsx
import { MaleAvatarViewer } from '../components/AvatarViewer';

<MaleAvatarViewer modelSrc="your-avatar-url.glb" />
```

#### FemaleAvatarViewer
```tsx
import { FemaleAvatarViewer } from '../components/AvatarViewer';

<FemaleAvatarViewer modelSrc="your-avatar-url.glb" />
```

#### EmissiveAvatarViewer
```tsx
import { EmissiveAvatarViewer } from '../components/AvatarViewer';

<EmissiveAvatarViewer modelSrc="your-avatar-url.glb" />
```

### Настройки по умолчанию

- **Освещение**: Трехточечная схема освещения с настроенными цветами
- **Камера**: Расстояние 3.2, цель на высоте 1.65
- **Эффекты**: Bloom эффект, тени, эмиссивные материалы
- **Фон**: Темный градиент rgb(9,20,26)
- **Анимация**: Idle анимация для мужского аватара

### Требования

- `@readyplayerme/visage` - для рендеринга аватара
- `three` - для 3D математики (Vector3)
- `@types/three` - типы TypeScript