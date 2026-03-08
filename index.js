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

function loadWordSwapMode() {
    prepareGlobals();
    
    const words = question.split(' ');
    const originalOrder = [...words];
    
    // Перемешиваем индексы слов
    const indices = Array.from({ length: words.length }, (_, i) => i);
    indices.sort(() => Math.random() - 0.5);
    
    // Применяем перемешивание
    const shuffledWords = indices.map(i => words[i]);
    
    // Создаем spans для каждого слова
    const spanned = shuffledWords.map((word, idx) => 
        `<span data-original-index="${indices[idx]}" data-current-index="${idx}" style="display: inline-block; transition: transform 0.5s ease;">${word}</span>`
    ).join(' ');
    
    content.innerHTML = spanned;
    title.innerText = 'Режим: смена двух слов';
    
    const spans = Array.from(content.querySelectorAll('span'));
    
    // Функция для обмена двух слов местами с анимацией
    const swapWords = (idx1, idx2, callback) => {
        if (idx1 === idx2) {
            callback();
            return;
        }
        
        const span1 = spans[idx1];
        const span2 = spans[idx2];
        
        // Получаем позиции элементов
        const rect1 = span1.getBoundingClientRect();
        const rect2 = span2.getBoundingClientRect();
        
        // Вычисляем расстояние для перемещения (X и Y)
        const deltaX1 = rect2.left - rect1.left;
        const deltaY1 = rect2.top - rect1.top;
        const deltaX2 = rect1.left - rect2.left;
        const deltaY2 = rect1.top - rect2.top;
        
        // Применяем трансформацию
        span1.style.transform = `translate(${deltaX1}px, ${deltaY1}px)`;
        span2.style.transform = `translate(${deltaX2}px, ${deltaY2}px)`;
        
        // После анимации меняем элементы местами в DOM
        setTimeout(() => {
            span1.style.transition = 'none';
            span2.style.transition = 'none';
            span1.style.transform = '';
            span2.style.transform = '';
            
            // Меняем местами в массиве
            [spans[idx1], spans[idx2]] = [spans[idx2], spans[idx1]];
            
            // Меняем в DOM
            const parent = span1.parentNode;
            const span1Next = span1.nextSibling;
            const span2Next = span2.nextSibling;
            
            if (span1Next === span2) {
                parent.insertBefore(span2, span1);
            } else if (span2Next === span1) {
                parent.insertBefore(span1, span2);
            } else {
                parent.insertBefore(span2, span1Next);
                parent.insertBefore(span1, span2Next);
            }
            
            // Обновляем current-index
            span1.setAttribute('data-current-index', idx2);
            span2.setAttribute('data-current-index', idx1);
            
            // Восстанавливаем transition
            setTimeout(() => {
                span1.style.transition = 'transform 0.5s ease';
                span2.style.transition = 'transform 0.5s ease';
                callback();
            }, 50);
        }, 500);
    };
    
    // Генерируем фиксированное количество обменов (100)
    const MAX_SWAPS = 100;
    const swaps = [];
    const currentOrder = [...indices];
    
    for (let i = 0; i < MAX_SWAPS; i++) {
        // Находим слова, которые не на своих местах
        const wrongPositions = [];
        for (let j = 0; j < currentOrder.length; j++) {
            if (currentOrder[j] !== j) {
                wrongPositions.push(j);
            }
        }
        
        // Если все слова на своих местах, выходим
        if (wrongPositions.length === 0) break;
        
        // Выбираем случайную неправильную позицию
        const pos = wrongPositions[Math.floor(Math.random() * wrongPositions.length)];
        
        // Находим, где находится элемент, который должен быть на позиции pos
        const targetPos = currentOrder.indexOf(pos);
        
        // Меняем элементы местами
        swaps.push([pos, targetPos]);
        [currentOrder[pos], currentOrder[targetPos]] = [currentOrder[targetPos], currentOrder[pos]];
    }
    
    const totalSwaps = swaps.length;
    if (totalSwaps === 0) return; // Уже отсортировано
    
    let currentSwapIndex = 0;
    
    // Вычисляем задержки так, чтобы все восстановилось за TOTAL_TIME
    const initialDelay = TOTAL_TIME / (3 * totalSwaps);
    const step = (4 * initialDelay) / (totalSwaps - 1);
    
    const performSwap = () => {
        if (currentSwapIndex < totalSwaps) {
            const [idx1, idx2] = swaps[currentSwapIndex];
            currentSwapIndex++;
            
            swapWords(idx1, idx2, () => {
                const nextDelay = initialDelay + currentSwapIndex * step;
                setTimeout(performSwap, nextDelay);
            });
        }
    };
    
    setTimeout(performSwap, initialDelay);
}

function loadWordShuffleMode() {
    prepareGlobals();
    
    const words = question.split(' ');
    
    // Массив для хранения зафиксированных слов
    const fixedWords = new Set();
    
    // Создаем spans для каждого слова
    const spans = words.map((word, idx) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.setAttribute('data-original-index', idx);
        span.style.display = 'inline-block';
        span.style.transition = 'all 0.3s ease';
        return span;
    });
    
    // Текущий порядок span'ов - сразу перемешиваем
    let currentOrder = [...spans];
    currentOrder.sort(() => Math.random() - 0.5);
    
    // Отображаем начальный (уже перемешанный) порядок
    content.innerHTML = '';
    currentOrder.forEach((span, idx) => {
        content.appendChild(span);
        if (idx < currentOrder.length - 1) {
            content.appendChild(document.createTextNode(' '));
        }
    });
    
    title.innerText = 'Режим: случайная перестановка';
    
    let shuffleCount = 0;
    const MAX_SHUFFLES = 100; // Максимальное количество перемешиваний
    
    // Функция перемешивания
    const shuffleWords = () => {
        if (shuffleCount >= MAX_SHUFFLES) return;
        
        // Собираем незафиксированные span'ы
        const movableSpans = [];
        const fixedPositions = new Map(); // позиция -> span
        
        currentOrder.forEach((span, idx) => {
            const originalIdx = parseInt(span.getAttribute('data-original-index'));
            if (fixedWords.has(originalIdx)) {
                fixedPositions.set(idx, span);
            } else {
                movableSpans.push(span);
            }
        });
        
        if (movableSpans.length === 0) return; // Все слова зафиксированы
        
        // Перемешиваем незафиксированные span'ы
        movableSpans.sort(() => Math.random() - 0.5);
        
        // Создаем новый порядок
        const newOrder = [];
        let movableIndex = 0;
        
        for (let i = 0; i < currentOrder.length; i++) {
            if (fixedPositions.has(i)) {
                newOrder.push(fixedPositions.get(i));
            } else {
                newOrder.push(movableSpans[movableIndex]);
                movableIndex++;
            }
        }
        
        currentOrder = newOrder;
        
        // Обновляем DOM
        content.innerHTML = '';
        currentOrder.forEach((span, idx) => {
            content.appendChild(span);
            if (idx < currentOrder.length - 1) {
                content.appendChild(document.createTextNode(' '));
            }
        });
        
        // Проверяем, какие слова встали на свои места
        currentOrder.forEach((span, idx) => {
            const originalIdx = parseInt(span.getAttribute('data-original-index'));
            if (originalIdx === idx && !fixedWords.has(originalIdx)) {
                // Слово на своем месте - фиксируем его
                fixedWords.add(originalIdx);
                span.style.fontWeight = 'bold';
                
                // Временная зеленая подсветка
                span.style.color = '#4CAF50';
                setTimeout(() => {
                    span.style.color = '';
                }, 800);
            }
        });
        
        shuffleCount++;
        
        // Вычисляем задержку до следующего перемешивания (увеличивается со временем)
        // Уменьшаем частоту в 4 раза
        const initialDelay = (TOTAL_TIME / (3 * MAX_SHUFFLES)) * 4;
        const step = (4 * initialDelay) / (MAX_SHUFFLES - 1);
        const nextDelay = initialDelay + shuffleCount * step;
        
        setTimeout(shuffleWords, nextDelay);
    };
    
    // Начинаем перемешивание
    const initialDelay = (TOTAL_TIME / (3 * MAX_SHUFFLES)) * 4;
    setTimeout(shuffleWords, initialDelay);
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
        'random-letter': loadRandomLetterMode,
        'word-swap': loadWordSwapMode,
        'word-shuffle': loadWordShuffleMode
    })[mode];

    if (loadFunc) loadFunc();
}

main();
