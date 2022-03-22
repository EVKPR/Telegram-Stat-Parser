/* Парсер статистики просмотров за прошлную неделю Telegram-канала из API TGStat */
	// Присылает статистику просмотров вашего канала за прошлую неделю
	// Написан на NodeJS с использованием библиотек axios и date-fns

const axios = require('axios'); // Подключаем к NodeJS библиотеку axios для скачивания страницы (нужно установить через npm заранее)
const datefns = require('date-fns'); // Подключаем к NodeJS библиотеку date-fns для работы с датами(нужно установить через npm заранее)
var previousMonday = require('date-fns/previousMonday'); // Загружаем из date-fns функцию получения даты предыдущего понедельника (начала диапазона)
var previousSunday = require('date-fns/previousSunday'); // Загружаем из date-fns функцию получения даты предыдущего воскресенья (конца диапазона)

// Параметры парсера
const tgsToken = 'yourtoken'; // Токен API TGStat
const channel = 'yourchannel'; // Юзернейм канала, по которому собирается статистика
const botToken = 'yourbot'; // Токен Telegram-бота, который будет присылать сообщение в чат
const chatID = 'yourchat'; // ID Telegram-чата, куда нужно присылать сообщение
const message = encodeURIComponent(' Ваш канал @yourchannel\nПросмотры за прошлую неделю: '); // Закодированный для передачи по сети текст сообщения для Telegram-чата

// Выяснение дат прошлой недели
var now = new Date(); // Получение сегодняшней даты

const getLastSunday = previousSunday(now); // Получение даты предыдущего воскресенья (конца диапазона)
var lastSundayReadable = new Date(getLastSunday.getFullYear(), getLastSunday.getMonth(), getLastSunday.getDate()); // Преобразование даты предыдущего понедельника в понятный формат
var getLastSundayTimestampJS = lastSundayReadable.getTime(); // Преобразование даты прошлого воскресенья в формат timestamp языка JavaScript
var endDate = getLastSundayTimestampJS / 1000; // Преобразование даты прошлого понедельника в формат timestamp языка PHP, понятный API TGStat

var getLastMonday = new Date(getLastSunday.getFullYear(), getLastSunday.getMonth(), getLastSunday.getDate() - 6); // Получение даты предыдущего понедельника (начала диапазона)
var lastMondayReadable = new Date(getLastMonday.getFullYear(), getLastMonday.getMonth(), getLastMonday.getDate()); // Преобразование даты предыдущего понедельника в понятный формат
var getLastMondayTimestampJS = lastMondayReadable.getTime(); // Преобразование даты прошлого понедельника в формат timestamp языка JavaScript, понятный API TGStat
var startDate = getLastMondayTimestampJS / 1000; // Преобразование даты прошлого понедельника в формат timestamp языка PHP, понятный API TGStat

console.log('Парсер запущен'); // Вывод уведомления в консоль, что парсер запущен
console.log('Дата предыдущего понедельника c - 6: ' + getLastMonday);
console.log('Дата предыдущего воскресенья (полная): ' + getLastSunday);
console.log('Дата предыдущего понедельника в понятном формате: ' + lastMondayReadable);
console.log('Дата предыдущего воскресенья в понятном формате: ' + lastSundayReadable);
console.log('Дата предыдущего понедельника в формате timestamp JS: ' + getLastMondayTimestampJS);
console.log('Дата предыдущего воскресенья в формате timestamp JS: ' + getLastSundayTimestampJS);
console.log('Дата предыдущего понедельника в формате timestamp PHP: ' + startDate);
console.log('Дата предыдущего воскресенья в формате timestamp PHP: ' + endDate);

const tgstat = 'https://api.tgstat.ru/channels/views?token=' + tgsToken + '&channelId=' + channel + '&startDate=' + startDate + '&endDate=' + endDate + '&group=week'; // URL для парсинга количества просмотров
console.log('Запрос статистики по ссылке ' + tgstat);
axios.get(tgstat)
	.then(response => {
		var rawStats = JSON.stringify(response.data);
		var weekStats = rawStats.slice(61, -3);
		// Блок отправки статистики в Telegram
		const sendLink = 'https://api.telegram.org/bot' + botToken + '/sendMessage?chat_id=' + chatID + '&parse_mode=HTML&text=' + message + '<b>' + weekStats + '</b>';
		axios.get(sendLink)
			.then(response => {
			console.log('Статистика отправлена в Telegram.');
		})
		.catch(error => {
		console.log('Ошибка: не удалось отправить статистику.');
		});
		// Конец блока отправки статистики в Telegram
	})
	.catch(error => {
		console.log(error);
	})