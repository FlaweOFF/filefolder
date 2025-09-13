const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Конфигурация
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_IMAGE_PATH = './test-image.jpg';

// Создаем тестовое изображение (1x1 пиксель в формате JPEG)
function createTestImage() {
    const testImageBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
        0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
        0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
        0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
        0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14,
        0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00, 0x02,
        0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0xFF, 0xD9
    ]);
    
    fs.writeFileSync(TEST_IMAGE_PATH, testImageBuffer);
    console.log('✅ Тестовое изображение создано');
}

// Тест 1: Проверка базового endpoint
async function testBasicEndpoint() {
    console.log('\n🔍 Тест 1: Проверка базового endpoint');
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        const data = await response.json();
        
        if (response.ok && data.message) {
            console.log('✅ Базовый endpoint работает');
            console.log(`   Сообщение: ${data.message}`);
            return true;
        } else {
            console.log('❌ Базовый endpoint не работает');
            return false;
        }
    } catch (error) {
        console.log('❌ Ошибка при проверке базового endpoint:', error.message);
        return false;
    }
}

// Тест 2: Загрузка изображения
async function testImageUpload() {
    console.log('\n🔍 Тест 2: Загрузка изображения');
    try {
        if (!fs.existsSync(TEST_IMAGE_PATH)) {
            createTestImage();
        }

        const formData = new FormData();
        formData.append('image', fs.createReadStream(TEST_IMAGE_PATH));

        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.success && data.data.imageId) {
            console.log('✅ Загрузка изображения работает');
            console.log(`   ID изображения: ${data.data.imageId}`);
            console.log(`   URL изображения: ${data.data.url}`);
            return data.data.imageId;
        } else {
            console.log('❌ Загрузка изображения не работает');
            console.log('   Ответ:', data);
            return null;
        }
    } catch (error) {
        console.log('❌ Ошибка при загрузке изображения:', error.message);
        return null;
    }
}

// Тест 3: Получение информации об изображении
async function testGetImageInfo(imageId) {
    console.log('\n🔍 Тест 3: Получение информации об изображении');
    try {
        const response = await fetch(`${API_BASE_URL}/api/image/${imageId}`);
        const data = await response.json();

        if (response.ok && data.success && data.data.id === imageId) {
            console.log('✅ Получение информации об изображении работает');
            console.log(`   Оригинальное имя: ${data.data.originalName}`);
            console.log(`   Размер: ${data.data.size} байт`);
            console.log(`   MIME тип: ${data.data.mimetype}`);
            return true;
        } else {
            console.log('❌ Получение информации об изображении не работает');
            console.log('   Ответ:', data);
            return false;
        }
    } catch (error) {
        console.log('❌ Ошибка при получении информации об изображении:', error.message);
        return false;
    }
}

// Тест 4: Проверка прямого доступа к изображению
async function testDirectImageAccess(imageId) {
    console.log('\n🔍 Тест 4: Проверка прямого доступа к изображению');
    try {
        // Сначала получим информацию об изображении
        const infoResponse = await fetch(`${API_BASE_URL}/api/image/${imageId}`);
        const infoData = await infoResponse.json();
        
        if (!infoData.success) {
            console.log('❌ Не удалось получить информацию об изображении');
            return false;
        }

        const filename = infoData.data.filename;
        const imageResponse = await fetch(`${API_BASE_URL}/uploads/${filename}`);

        if (imageResponse.ok && imageResponse.headers.get('content-type').startsWith('image/')) {
            console.log('✅ Прямой доступ к изображению работает');
            console.log(`   URL: ${API_BASE_URL}/uploads/${filename}`);
            return true;
        } else {
            console.log('❌ Прямой доступ к изображению не работает');
            return false;
        }
    } catch (error) {
        console.log('❌ Ошибка при проверке прямого доступа:', error.message);
        return false;
    }
}

// Тест 5: Получение списка всех изображений
async function testGetAllImages() {
    console.log('\n🔍 Тест 5: Получение списка всех изображений');
    try {
        const response = await fetch(`${API_BASE_URL}/api/images`);
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.data)) {
            console.log('✅ Получение списка изображений работает');
            console.log(`   Количество изображений: ${data.count}`);
            return true;
        } else {
            console.log('❌ Получение списка изображений не работает');
            console.log('   Ответ:', data);
            return false;
        }
    } catch (error) {
        console.log('❌ Ошибка при получении списка изображений:', error.message);
        return false;
    }
}

// Тест 6: Удаление изображения
async function testDeleteImage(imageId) {
    console.log('\n🔍 Тест 6: Удаление изображения');
    try {
        const response = await fetch(`${API_BASE_URL}/api/image/${imageId}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ Удаление изображения работает');
            return true;
        } else {
            console.log('❌ Удаление изображения не работает');
            console.log('   Ответ:', data);
            return false;
        }
    } catch (error) {
        console.log('❌ Ошибка при удалении изображения:', error.message);
        return false;
    }
}

// Основная функция тестирования
async function runTests() {
    console.log('🚀 Запуск тестов API сервиса загрузки изображений');
    console.log(`📍 Тестируем: ${API_BASE_URL}`);
    console.log('=' .repeat(60));

    const results = {
        basic: false,
        upload: null,
        getInfo: false,
        directAccess: false,
        getAll: false,
        delete: false
    };

    // Запускаем тесты
    results.basic = await testBasicEndpoint();
    
    if (results.basic) {
        results.upload = await testImageUpload();
        
        if (results.upload) {
            results.getInfo = await testGetImageInfo(results.upload);
            results.directAccess = await testDirectImageAccess(results.upload);
            results.getAll = await testGetAllImages();
            results.delete = await testDeleteImage(results.upload);
        }
    }

    // Результаты
    console.log('\n' + '=' .repeat(60));
    console.log('📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ:');
    console.log('=' .repeat(60));
    console.log(`✅ Базовый endpoint: ${results.basic ? 'РАБОТАЕТ' : 'НЕ РАБОТАЕТ'}`);
    console.log(`✅ Загрузка изображения: ${results.upload ? 'РАБОТАЕТ' : 'НЕ РАБОТАЕТ'}`);
    console.log(`✅ Получение информации: ${results.getInfo ? 'РАБОТАЕТ' : 'НЕ РАБОТАЕТ'}`);
    console.log(`✅ Прямой доступ: ${results.directAccess ? 'РАБОТАЕТ' : 'НЕ РАБОТАЕТ'}`);
    console.log(`✅ Список изображений: ${results.getAll ? 'РАБОТАЕТ' : 'НЕ РАБОТАЕТ'}`);
    console.log(`✅ Удаление изображения: ${results.delete ? 'РАБОТАЕТ' : 'НЕ РАБОТАЕТ'}`);

    const successCount = Object.values(results).filter(r => r === true).length;
    const totalTests = 6;
    
    console.log('\n' + '=' .repeat(60));
    console.log(`🎯 ИТОГО: ${successCount}/${totalTests} тестов пройдено`);
    
    if (successCount === totalTests) {
        console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ! API работает корректно.');
    } else {
        console.log('⚠️  Некоторые тесты не пройдены. Проверьте настройки сервера.');
    }

    // Очистка
    if (fs.existsSync(TEST_IMAGE_PATH)) {
        fs.unlinkSync(TEST_IMAGE_PATH);
        console.log('\n🧹 Тестовое изображение удалено');
    }
}

// Запуск тестов
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };
