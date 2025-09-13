# Сервис загрузки изображений

REST API сервис для загрузки, хранения и получения изображений.

## Установка и запуск

### Локальная разработка

1. Установите зависимости:
```bash
npm install
```

2. Запустите сервер:
```bash
npm start
```

Для разработки с автоперезагрузкой:
```bash
npm run dev
```

Сервер будет доступен по адресу: `http://localhost:3000`

### Развертывание на Railway.app

1. **Создайте репозиторий на GitHub:**
   - Загрузите все файлы проекта в новый репозиторий
   - Убедитесь, что все файлы загружены (включая .gitignore, railway.json, Procfile)

2. **Подключите к Railway:**
   - Перейдите на [railway.app](https://railway.app)
   - Войдите через GitHub
   - Нажмите "New Project" → "Deploy from GitHub repo"
   - Выберите ваш репозиторий

3. **Настройка переменных окружения (опционально):**
   - В настройках проекта Railway можно добавить переменные окружения
   - `PORT` - порт сервера (Railway автоматически устанавливает)
   - `RAILWAY_STATIC_URL` - базовый URL для статических файлов

4. **Автоматический деплой:**
   - Railway автоматически обнаружит Node.js проект
   - Установит зависимости из package.json
   - Запустит сервер с помощью команды из Procfile

5. **Получение URL:**
   - После деплоя Railway предоставит уникальный URL
   - Например: `https://your-project-name.railway.app`
   - API будет доступно по адресу: `https://your-project-name.railway.app/api/upload`

## API Endpoints

### 1. Загрузка изображения
**POST** `/api/upload`

Загружает изображение на сервер.

**Параметры:**
- `image` (multipart/form-data) - файл изображения

**Поддерживаемые форматы:** jpeg, jpg, png, gif, webp
**Максимальный размер:** 10MB

**Пример запроса (curl):**
```bash
# Локально
curl -X POST -F "image=@/path/to/your/image.jpg" http://localhost:3000/api/upload

# На Railway
curl -X POST -F "image=@/path/to/your/image.jpg" https://your-project-name.railway.app/api/upload
```

**Пример ответа:**
```json
{
  "success": true,
  "message": "Изображение успешно загружено",
  "data": {
    "imageId": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://your-project-name.railway.app/uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
    "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
    "originalName": "my-image.jpg",
    "size": 1024000
  }
}
```

### 2. Получение информации об изображении
**GET** `/api/image/:id`

Получает метаданные изображения по его ID.

**Пример запроса:**
```bash
# Локально
curl http://localhost:3000/api/image/550e8400-e29b-41d4-a716-446655440000

# На Railway
curl https://your-project-name.railway.app/api/image/550e8400-e29b-41d4-a716-446655440000
```

**Пример ответа:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
    "originalName": "my-image.jpg",
    "url": "http://localhost:3000/uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Получение списка всех изображений
**GET** `/api/images`

Получает список всех загруженных изображений.

**Пример запроса:**
```bash
curl http://localhost:3000/api/images
```

**Пример ответа:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
      "originalName": "my-image.jpg",
      "url": "http://localhost:3000/uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
      "size": 1024000,
      "mimetype": "image/jpeg",
      "uploadedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### 4. Удаление изображения
**DELETE** `/api/image/:id`

Удаляет изображение с сервера.

**Пример запроса:**
```bash
curl -X DELETE http://localhost:3000/api/image/550e8400-e29b-41d4-a716-446655440000
```

**Пример ответа:**
```json
{
  "success": true,
  "message": "Изображение успешно удалено"
}
```

### 5. Прямой доступ к изображению
**GET** `/uploads/:filename`

Прямой доступ к загруженному изображению по имени файла.

**Пример:**
```
# Локально
http://localhost:3000/uploads/550e8400-e29b-41d4-a716-446655440000.jpg

# На Railway
https://your-project-name.railway.app/uploads/550e8400-e29b-41d4-a716-446655440000.jpg
```

## Пример использования в JavaScript

```javascript
// Конфигурация API
const API_BASE_URL = 'https://your-project-name.railway.app'; // Замените на ваш URL Railway

// Загрузка изображения
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    return result.data.url; // URL изображения
}

// Получение информации об изображении
async function getImageInfo(imageId) {
    const response = await fetch(`${API_BASE_URL}/api/image/${imageId}`);
    const result = await response.json();
    return result.data;
}

// Получение списка всех изображений
async function getAllImages() {
    const response = await fetch(`${API_BASE_URL}/api/images`);
    const result = await response.json();
    return result.data;
}
```

## Пример использования в Python

```python
import requests

# Конфигурация API
API_BASE_URL = 'https://your-project-name.railway.app'  # Замените на ваш URL Railway

# Загрузка изображения
def upload_image(file_path):
    url = f'{API_BASE_URL}/api/upload'
    with open(file_path, 'rb') as f:
        files = {'image': f}
        response = requests.post(url, files=files)
    return response.json()['data']['url']

# Получение информации об изображении
def get_image_info(image_id):
    url = f'{API_BASE_URL}/api/image/{image_id}'
    response = requests.get(url)
    return response.json()['data']

# Получение списка всех изображений
def get_all_images():
    url = f'{API_BASE_URL}/api/images'
    response = requests.get(url)
    return response.json()['data']
```

## Структура проекта

```
filefolder/
├── server.js          # Основной файл сервера
├── package.json       # Зависимости проекта
├── README.md          # Документация
├── .gitignore         # Игнорируемые файлы для Git
├── railway.json       # Конфигурация Railway
├── Procfile           # Команда запуска для Railway
└── uploads/           # Папка с загруженными изображениями (создается автоматически)
```

## Особенности

- Автоматическая генерация уникальных имен файлов
- Проверка типа файла (только изображения)
- Ограничение размера файла (10MB)
- CORS поддержка для кросс-доменных запросов
- Метаданные изображений хранятся в памяти
- Прямой доступ к изображениям через URL

## Настройка

Для изменения порта сервера установите переменную окружения:
```bash
PORT=8080 npm start
```

Для изменения лимита размера файла отредактируйте параметр `fileSize` в `server.js`.

## Пошаговая инструкция по деплою на Railway

### Шаг 1: Подготовка репозитория GitHub

1. Создайте новый репозиторий на GitHub
2. Склонируйте репозиторий локально:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

3. Скопируйте все файлы проекта в папку репозитория:
   - `server.js`
   - `package.json`
   - `README.md`
   - `.gitignore`
   - `railway.json`
   - `Procfile`

4. Загрузите файлы в GitHub:
   ```bash
   git add .
   git commit -m "Initial commit: Image upload service"
   git push origin main
   ```

### Шаг 2: Развертывание на Railway

1. Перейдите на [railway.app](https://railway.app)
2. Нажмите "Login" и войдите через GitHub
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub repo"
5. Выберите ваш репозиторий
6. Railway автоматически:
   - Обнаружит Node.js проект
   - Установит зависимости
   - Запустит сервер

### Шаг 3: Получение URL

1. После успешного деплоя Railway предоставит URL вида:
   `https://your-project-name-production.up.railway.app`

2. Обновите примеры в коде, заменив `your-project-name.railway.app` на ваш реальный URL

### Шаг 4: Тестирование

Протестируйте API:
```bash
# Проверка работы сервера
curl https://your-project-name-production.up.railway.app/

# Загрузка изображения
curl -X POST -F "image=@/path/to/test-image.jpg" https://your-project-name-production.up.railway.app/api/upload
```

### Автоматические обновления

После настройки Railway будет автоматически пересобирать и развертывать ваш проект при каждом push в основную ветку GitHub репозитория.
