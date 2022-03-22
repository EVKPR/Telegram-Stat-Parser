/* Парсер статистики просмотров Telegram-канала из API TGStat */
	// Присылает статистику просмотров вашего канала за вчерашний день
	// Написан на NodeJS с использованием библиотеки axios

const axios = require('axios'); // Подключаем к NodeJS библиотеку axios для скачивания страницы (нужно установить через npm заранее)

// Параметры парсера
const tgsToken = 'yourtoken'; // Токен API TGStat
const channel = 'yourchannel'; // Юзернейм канала, по которому собирается статистика
const botToken = 'yourbot'; // Токен Telegram-бота, который будет присылать сообщение в чат
const chatID = 'yourchat'; // ID Telegram-чата, куда нужно присылать сообщение
const message = encodeURIComponent(' Ваш канал @yourchannel\nПросмотры за вчера: '); // Закодированный для передачи по сети текст сообщения для Telegram-чата

// Выяснение даты вчерашнего дня
var now = new Date(); // Получение сегодняшней даты
var normalYesterdayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1); // Получение вчерашней даты в понятном формате
var dateTimestampJavascript = normalYesterdayDate.getTime(); // Преобразование вчерашней даты в формат timestamp языка JavaScript
var dateTimestampTGStat = dateTimestampJavascript / 1000; // Преобразование вчерашней даты в формат timestamp языка PHP, понятный API TGStat

console.log('Парсер запущен'); // Вывод уведомления в консоль, что парсер запущен
console.log('Получение вчерашней даты: ' + normalYesterdayDate);
console.log('Преобразование даты в формат timestamp JavaScript: ' + dateTimestampJavascript);
console.log('Преобразование даты в формат timestamp PHP: ' + dateTimestampTGStat);

const tgstat = 'https://api.tgstat.ru/channels/views?token=' + tgsToken + '&channelId=' + channel + '&startDate=' + dateTimestampTGStat + '&endDate=' + dateTimestampTGStat + '&group=day'; // URL для парсинга количества просмотров
console.log('Запрос статистики по ссылке ' + tgstat);
axios.get(tgstat)
	.then(response => {
		var rawStats = JSON.stringify(response.data);
		var weekStats = rawStats.slice(64, -3);
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
		console.log('Ошибка: не удалось получить статистику.');
	})