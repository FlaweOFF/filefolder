const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Создаем папку для загруженных изображений, если её нет
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка CORS
app.use(cors());

// Парсинг JSON
app.use(express.json());

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Генерируем уникальное имя файла с сохранением расширения
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// Фильтр для проверки типа файла (только изображения)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Разрешены только изображения (jpeg, jpg, png, gif, webp)'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB лимит
    }
});

// Статическое обслуживание загруженных файлов
app.use('/uploads', express.static(uploadsDir));

// Хранилище для метаданных изображений
const imageMetadata = new Map();

// API для загрузки изображения
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Файл не был загружен'
            });
        }

        const imageId = uuidv4();
        const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : `http://localhost:${PORT}`;
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        
        // Сохраняем метаданные
        imageMetadata.set(imageId, {
            id: imageId,
            filename: req.file.filename,
            originalName: req.file.originalname,
            url: imageUrl,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Изображение успешно загружено',
            data: {
                imageId: imageId,
                url: imageUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Ошибка при загрузке:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при загрузке файла',
            error: error.message
        });
    }
});

// API для получения информации об изображении по ID
app.get('/api/image/:id', (req, res) => {
    try {
        const imageId = req.params.id;
        const metadata = imageMetadata.get(imageId);

        if (!metadata) {
            return res.status(404).json({
                success: false,
                message: 'Изображение не найдено'
            });
        }

        res.json({
            success: true,
            data: metadata
        });
    } catch (error) {
        console.error('Ошибка при получении изображения:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера',
            error: error.message
        });
    }
});

// API для получения списка всех изображений
app.get('/api/images', (req, res) => {
    try {
        const images = Array.from(imageMetadata.values());
        
        res.json({
            success: true,
            data: images,
            count: images.length
        });
    } catch (error) {
        console.error('Ошибка при получении списка изображений:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера',
            error: error.message
        });
    }
});

// API для удаления изображения
app.delete('/api/image/:id', (req, res) => {
    try {
        const imageId = req.params.id;
        const metadata = imageMetadata.get(imageId);

        if (!metadata) {
            return res.status(404).json({
                success: false,
                message: 'Изображение не найдено'
            });
        }

        // Удаляем файл с диска
        const filePath = path.join(uploadsDir, metadata.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Удаляем метаданные
        imageMetadata.delete(imageId);

        res.json({
            success: true,
            message: 'Изображение успешно удалено'
        });
    } catch (error) {
        console.error('Ошибка при удалении изображения:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера',
            error: error.message
        });
    }
});

// Обработка ошибок multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Файл слишком большой. Максимальный размер: 10MB'
            });
        }
    }
    
    res.status(400).json({
        success: false,
        message: error.message
    });
});

// Базовый маршрут
app.get('/', (req, res) => {
    res.json({
        message: 'Сервис загрузки изображений',
        endpoints: {
            'POST /api/upload': 'Загрузить изображение',
            'GET /api/image/:id': 'Получить информацию об изображении',
            'GET /api/images': 'Получить список всех изображений',
            'DELETE /api/image/:id': 'Удалить изображение',
            'GET /uploads/:filename': 'Прямой доступ к изображению'
        }
    });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`API доступно по адресу: http://localhost:${PORT}`);
    console.log(`Загруженные изображения доступны по адресу: http://localhost:${PORT}/uploads/`);
});
