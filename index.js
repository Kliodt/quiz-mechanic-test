const TOTAL_TIME = 120 * 1000;

let timerTimeoutId = 0;
let timerStartDate = 0;
let rightAnswer = '';
let question = '';
let comment = ''

function prepareGlobals() {
    const obj= randomQuestion();
    question = obj.question;
    rightAnswer = obj.answer.trim().toLowerCase();
    comment = obj.comment;
    timerStart();
}

function loadAppearingMode() {
    prepareGlobals();
    const spanned = question.split(' ').map(word => `<span style="display: inline-block; opacity: 0; transform: scale(0);">${word}</span>`).join(' ')
    content.innerHTML = spanned;
    title.innerText = 'Режим: появляющиеся слова'

    const spans = content.querySelectorAll('span');
    let indices = Array.from({ length: spans.length }, (_, i) => i);
    indices.sort(() => Math.random() - 0.5);

    const totalWords = indices.length;
    let currentIndex = 0;

    // Вычисляем задержки так, чтобы все восстановилось за 100 секунд
    const initialDelay = TOTAL_TIME / (3 * totalWords);
    const step = (4 * initialDelay) / (totalWords - 1);

    const revealWords = () => {
        if (currentIndex < totalWords) {
            const randomIdx = indices[currentIndex];
            spans[randomIdx].style.opacity = '1';
            spans[randomIdx].style.transform = 'scale(1)';
            spans[randomIdx].style.transition = 'opacity 0.5s, transform 0.5s';
            currentIndex++;

            const nextDelay = initialDelay + currentIndex * step;
            setTimeout(revealWords, nextDelay);
        }
    };
    setTimeout(revealWords, initialDelay);
}

function loadDisappearingMode() {
    prepareGlobals();
    const spanned = question.split(' ').map(word => `<span style="display: inline-block; opacity: 1; transform: scale(1);">${word}</span>`).join(' ')
    content.innerHTML = spanned;
    title.innerText = 'Режим: исчезающие слова'

    const spans = content.querySelectorAll('span');
    let indices = Array.from({ length: spans.length }, (_, i) => i);
    indices.sort(() => Math.random() - 0.5);

    const totalWords = indices.length;
    let currentIndex = 0;

    // Вычисляем задержки так, чтобы все исчезло за 100 секунд
    const initialDelay = TOTAL_TIME / (3 * totalWords);
    const step = (4 * initialDelay) / (totalWords - 1);

    const hideWords = () => {
        if (currentIndex < totalWords) {
            const randomIdx = indices[currentIndex];
            spans[randomIdx].style.opacity = '0';
            spans[randomIdx].style.transform = 'scale(0)';
            spans[randomIdx].style.transition = 'opacity 0.5s, transform 0.5s';
            currentIndex++;

            const nextDelay = initialDelay + currentIndex * step;
            setTimeout(hideWords, nextDelay);
        }
    };
    setTimeout(hideWords, initialDelay);
}

function loadDyslexiaMode() {
    prepareGlobals();
    const words = question.split(' ');

    // Функция для перемешивания букв в слове
    const scrambleWord = (word) => {
        const letters = word.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        return letters.join('');
    };

    // Перемешиваем все слова
    const wordsToScramble = new Set(Array.from({ length: words.length }, (_, i) => i));

    // Создаем spans с перемешанными словами
    const originalWords = [...words];
    const scrambledWords = words.map((word, idx) => {
        if (wordsToScramble.has(idx)) {
            return scrambleWord(word);
        }
        return word;
    });

    const spans = scrambledWords.map((word, idx) => {
        const isScrambled = wordsToScramble.has(idx);
        const style = isScrambled
            ? 'opacity: 0.5; filter: blur(0.5px);'
            : 'font-weight: bold; opacity: 1;';
        return `<span data-original="${originalWords[idx]}" data-scrambled="${isScrambled}" data-restored="false" style="${style}">${word}</span>`;
    }).join(' ');

    content.innerHTML = spans;
    title.innerText = 'Режим: дислексия'

    // Постоянное перемешивание нерестороженных слов
    const scrambleInterval = setInterval(() => {
        const spanElements = Array.from(content.querySelectorAll('span'));
        spanElements.forEach(span => {
            if (span.getAttribute('data-scrambled') === 'true' && span.getAttribute('data-restored') === 'false') {
                const original = span.getAttribute('data-original');
                span.textContent = scrambleWord(original);
            }
        });
    }, 100); // Каждые 0.1 секунды

    // Восстанавливаем слова в случайном порядке
    const scrambledIndices = Array.from(wordsToScramble);
    scrambledIndices.sort(() => Math.random() - 0.5);
    const totalWords = scrambledIndices.length;
    let currentIndex = 0;

    // Вычисляем задержки так, чтобы все восстановилось за 100 секунд
    // С линейным увеличением времени между восстановлениями
    // Последняя задержка в 5 раз больше первой
    const initialDelay = TOTAL_TIME / (3 * totalWords);
    const step = (4 * initialDelay) / (totalWords - 1);

    const restoreWords = () => {
        if (currentIndex < totalWords) {
            const spanElements = Array.from(content.querySelectorAll('span'));
            const wordIdx = scrambledIndices[currentIndex];
            const span = spanElements[wordIdx];
            const originalWord = span.getAttribute('data-original');

            // Помечаем как восстановленное
            span.setAttribute('data-restored', 'true');

            // Анимация восстановления
            span.style.transition = 'color 0.5s, transform 0.3s, opacity 0.5s, filter 0.5s';
            span.style.color = '#4CAF50';
            span.style.transform = 'scale(1.1)';

            setTimeout(() => {
                span.textContent = originalWord;
                span.style.opacity = '1';
                span.style.filter = 'blur(0)';
                span.style.fontWeight = 'bold';
                setTimeout(() => {
                    span.style.transform = 'scale(1)';
                    span.style.color = '';
                }, 300);
            }, 150);

            currentIndex++;

            // Вычисляем следующую задержку (линейно возрастает)
            const nextDelay = initialDelay + currentIndex * step;
            setTimeout(restoreWords, nextDelay);
        } else {
            // Останавливаем перемешивание когда все восстановлено
            clearInterval(scrambleInterval);
        }
    };

    setTimeout(restoreWords, initialDelay);
}

function loadRandomLetterMode() {
    prepareGlobals();
    
    // Получаем все уникальные буквы из текста (игнорируя регистр)
    const letters = new Set();
    for (const char of question) {
        if (char.match(/[а-яА-ЯёЁa-zA-Z]/)) {
            letters.add(char.toLowerCase());
        }
    }
    
    // Создаем spans для каждого символа
    const chars = question.split('');
    const spanned = chars.map((char) => {
        const letterType = char.match(/[а-яА-ЯёЁa-zA-Z]/) ? char.toLowerCase() : char;
        return `<span data-revealed="false" data-letter="${letterType}" style="opacity: 0;">${char}</span>`;
    }).join('');
    
    content.innerHTML = spanned;
    title.innerText = 'Режим: случайная буква';
    
    // Собираем все буквы
    const spans = Array.from(content.querySelectorAll('span'));
    const lettersArray = Array.from(letters);
    
    // Перемешиваем буквы
    lettersArray.sort(() => Math.random() - 0.5);
    
    const totalLetters = lettersArray.length;
    if (totalLetters === 0) return; // Если нечего открывать
    
    let currentIndex = 0;
    
    // Вычисляем задержки так, чтобы все открылось за TOTAL_TIME
    // С линейным увеличением времени между раскрытиями
    const initialDelay = TOTAL_TIME / (3 * totalLetters);
    const step = (4 * initialDelay) / (totalLetters - 1);
    
    const revealLetters = () => {
        if (currentIndex < totalLetters) {
            const letterToReveal = lettersArray[currentIndex];
            
            // Находим все span'ы с этой буквой и открываем их
            spans.forEach(span => {
                if (span.getAttribute('data-letter') === letterToReveal && span.getAttribute('data-revealed') === 'false') {
                    span.style.opacity = '1';
                    span.style.transition = 'opacity 0.3s';
                    span.setAttribute('data-revealed', 'true');
                }
            });
            
            currentIndex++;
            
            const nextDelay = initialDelay + currentIndex * step;
            setTimeout(revealLetters, nextDelay);
        }
    };
    
    setTimeout(revealLetters, initialDelay);
}


function timerGetSeconds() {
    return Math.floor((Date.now() - timerStartDate) / 1000);
}

function timerStart() {
    clearTimeout(timerTimeoutId);
    timerStartDate = Date.now();
    const updateTimer = () => {
        timer.innerHTML = `Время: ${timerGetSeconds()}с.`;
        timerTimeoutId = setTimeout(() => updateTimer(), 50)
    }
    updateTimer();
}

function timerStop() {
    clearTimeout(timerTimeoutId);
}

function timerReset() {
    clearTimeout(timerTimeoutId);
    timer.innerHTML = '';
}

function revealAnswer() {
    dialog.innerHTML = `
    <header>Раскрытие ответа</header>
    <p><strong>Вопрос:</strong> ${question}</p>
    <p><strong>Правильный ответ:</strong> ${rightAnswer}</p>
    ${comment ? `<p><strong>Комментарий:</strong> ${comment}</p>` : ''}
    <form method="dialog">
        <button>Закрыть</button>
    </form>
    `;
    dialog.showModal();
}

function main() {
    if (document.readyState !== 'complete') {        
        setTimeout(main, 100);
        return;
    }
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') || 'menu';
    menu.hidden = mode !== 'menu';
    quiz.hidden = mode === 'menu';

    const loadFunc = ({
        'appearing': loadAppearingMode,
        'disappearing': loadDisappearingMode,
        'dyslexia': loadDyslexiaMode,
        'random-letter': loadRandomLetterMode
    })[mode];

    if (loadFunc) loadFunc();
}

main();
