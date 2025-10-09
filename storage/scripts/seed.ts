import { UsersStore } from '../src/services/users.store';
import * as path from 'path';

/**
 * Скрипт для инициализации данных
 * Создает администратора по умолчанию, если users.json пуст
 */
async function seedData() {
  try {
    console.log('🌱 Starting data seeding...');

    const dataPath = process.env.STORAGE_DATA_PATH || './data';
    const usersStore = new UsersStore(dataPath);

    // Инициализируем хранилище
    await usersStore.initialize();

    // Проверяем, есть ли уже пользователи
    const allUsers = await usersStore.getAllUsers();
    
    if (allUsers.success && allUsers.data && allUsers.data.length > 0) {
      console.log('✅ Users already exist, skipping seed');
      return;
    }

    // Создаем администратора по умолчанию
    console.log('👤 Creating default admin user...');
    
    const adminResult = await usersStore.createUser({
      name: 'admin',
      password: 'admin123',
      role: 'admin'
    });

    if (adminResult.success) {
      console.log('✅ Default admin user created successfully');
      console.log('   Email: admin');
      console.log('   Password: admin123');
      console.log('   Role: admin');
    } else {
      console.error('❌ Failed to create admin user:', adminResult.error);
    }

    // Создаем тестового студента
    console.log('👤 Creating test student user...');
    
    const studentResult = await usersStore.createUser({
      name: 'student1',
      password: 'student123',
      role: 'student'
    });

    if (studentResult.success) {
      console.log('✅ Test student user created successfully');
      console.log('   Name: student1');
      console.log('   Password: student123');
      console.log('   Role: student');
    } else {
      console.error('❌ Failed to create student user:', studentResult.error);
    }

    console.log('🎉 Data seeding completed successfully!');
    
  } catch (error) {
    console.error('💥 Error during data seeding:', error);
    process.exit(1);
  }
}

// Запускаем скрипт, если он вызван напрямую
if (require.main === module) {
  seedData();
}

export { seedData };


