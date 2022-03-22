/* Парсер статистики просмотров Telegram-канала из API TGStat */
	// Присылает количество просмотров трёх лучших постов в вашем канале за вчерашний день
	// Написан на NodeJS с использованием библиотеки axios

const axios = require('axios'); // Подключаем к NodeJS библиотеку axios для скачивания страницы (нужно установить через npm заранее)

// Параметры парсера
const tgsToken = 'yourtoken'; // Токен API TGStat
const channel = 'yourchannel'; // Юзернейм канала, по которому собирается статистика
const botToken = 'yourbot'; // Токен Telegram-бота, который будет присылать сообщение в чат
const chatID = 'yourchat'; // ID Telegram-чата, куда нужно присылать сообщение
const message = encodeURIComponent(' Ваш канал @yourchannel\nСамые популярные посты за вчера (количество просмотров): 	'); // Закодированный для передачи по сети текст сообщения для Telegram-чата

// Выяснение даты вчерашнего дня
var now = new Date(); // Получение сегодняшней даты

var normalYesterdayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1); // Получение вчерашней даты в понятном формате
var yesterdayDateTimestampJavascript = normalYesterdayDate.getTime(); // Преобразование вчерашней даты в формат timestamp языка JavaScript
var startTime = yesterdayDateTimestampJavascript / 1000; // Преобразование вчерашней даты в формат timestamp языка PHP, понятный API TGStat

var normalTodayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Получение сегодняшней даты в понятном формате
var TodayDateTimestampJavascript = normalTodayDate.getTime(); // Преобразование вчерашней даты в формат timestamp языка JavaScript
var endTime = TodayDateTimestampJavascript / 1000; // Преобразование вчерашней даты в формат timestamp языка PHP, понятный API TGStat

console.log('Парсер запущен'); // Вывод уведомления в консоль, что парсер запущен
console.log('Получение вчерашней даты: ' + normalYesterdayDate);
console.log('Преобразование вчерашней даты в формат timestamp JavaScript: ' + yesterdayDateTimestampJavascript);
console.log('Преобразование вчерашней даты в формат timestamp PHP: ' + startTime);
console.log('Получение сегодняшней даты: ' + normalTodayDate);

const tgstat = 'https://api.tgstat.ru/channels/posts?token=' + tgsToken + '&channelId=' + channel + '&limit=50&startTime=' + startTime + '&endTime=' + endTime + '&hideForwards=1&hideDeleted=1'; // URL для парсинга количества просмотров
console.log('Запрос статистики по ссылке ' + tgstat);
axios.get(tgstat)
	.then(response => {
		var jsonResponse = response.data; // Получение от TGStat ответа со списком постов в формате JSON
		var jsonLength = Object.keys(jsonResponse.response.items).length; // Определение количества полученных в ответе постов
		console.log('Ответ содержит ' + jsonLength + ' постов'); // Уведомление в консоль о количестве полученных в ответе постов
		var allViews = new Array(); // Объявление массива для записи количества значений всех полученных постов
		
		// Добавление в массив количества просмотров всех полученных постов
		for (var i = 0; i < jsonLength; ++i) {
			allViews.push(jsonResponse.response.items[i].views);
			console.log('Количество просмотров поста N' + (i+1) + ': ' + allViews[i]);
		};
			
		// Объявление функции сортировки элементов массива просмотров
		function compareViews(b, a) {
			if (a > b) return 1;
			if (a == b) return 0;
			if (a < b) return -1;
		};
		
		allViews.sort(compareViews); // Сортировка количества просмотров по убывающей
		
		// Если за день не было ни одного поста, значение поста N1 не записывается в массив, т.к. его не существует
		if (typeof allViews[0] == 'undefined') {
			allViews[0] = encodeURIComponent('Ошибка: не найдены посты за вчерашний день.');
		};
		
		// Если всего за день было меньше 2-х постов, значение поста N2 не записывается в массив, т.к. его не существует
		if (typeof allViews[1] == 'undefined') {
			allViews[1] = encodeURIComponent(' ');
		};
		
		// Если всего за день было меньше 3-х постов, значение поста N3 не записывается в массив, т.к. его не существует
		if (typeof allViews[2] == 'undefined') {
			allViews[2] = encodeURIComponent(' ');
		};
		
		console.log('Самые популярные посты за вчера: ' + allViews[0], allViews[1], allViews[2]);
		// Блок отправки статистики в Telegram
		const sendLink = 'https://api.telegram.org/bot' + botToken + '/sendMessage?chat_id=' + chatID + '&parse_mode=HTML&text=' + message + '<b>' + allViews[0] + '\n' + allViews[1] + '\n' + allViews[2] + '</b>';
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
		console.log('Ошибка: не удалось получить статистику (возможно, в канале не было оригинальных постов за данный период, только репосты).');
	})