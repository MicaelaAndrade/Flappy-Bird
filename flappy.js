function novoElemento(tagName, className) {
    const elem = document.createElement(tagName);
    elem.className = className;
    return elem;
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira');

    const borda = novoElemento('div', 'borda');
    const corpo = novoElemento('div', 'corpo');
    this.elemento.appendChild(reversa ? corpo : borda);
    this.elemento.appendChild(reversa ? borda : corpo);

    this.setAltura = altura => corpo.style.height = `${altura}px`;
}


//  para testar a barreira no jogo
// const b = new Barreira(true) // colocando false barreira ficará para cima, resersa 
// b.setAltura(200) // colocando tamanho da barreira 
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function parDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras');

    this.superior = new Barreira(true);
    this.inferior = new Barreira(false);

    this.elemento.appendChild(this.superior.elemento);
    this.elemento.appendChild(this.inferior.elemento);

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura);
        const alturaInferior = altura - abertura - alturaSuperior;
        this.superior.setAltura(alturaSuperior);
        this.inferior.setAltura(alturaInferior);
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]);
    this.setX = x => this.elemento.style.left = `${x}px`;
    this.getLargura = () => this.elemento.clientWidth;

    this.sortearAbertura();
    this.setX(x);
}

// testando 
// função construtora 
// const b = new parDeBarreiras(500, 200, 400) // passando os paramentros, randômica
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new parDeBarreiras(altura, abertura, largura),
        new parDeBarreiras(altura, abertura, largura + espaco),
        new parDeBarreiras(altura, abertura, largura + espaco * 2),
        new parDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3; // tempo da exibição
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento);

            // quando o elemento sair da área do jogo
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length);
                par.sortearAbertura()
            }

            const meio = largura / 2;
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio;
            cruzouOMeio && notificarPonto()

        })
    }
}

//  criando o passaro 
function Passaro(alturaJogo) {
    let voando = false // quando o usuário estiver apertando qualquer tecla, o passaro irá começar a subir, quando o usuário para de aperta a tecla usuário ira cair.

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]) // pegando a posição do passaro
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true // pegando qualquer tecla do usuário 
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5) // flag está voando ou não
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        // fazendo a checagem 
        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2) // calculando em pixel
}


// Progresso do jogo

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

// testando 
// const barreiras = new Barreiras(480, 1200, 200, 400);
// const passaro = new Passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy');

// areaDoJogo.appendChild(passaro.elemento)
// areaDoJogo.appendChild(new Progresso().elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento));
// setInterval(() => {
//     barreiras.animar();
//     passaro.animar()
// }, 20)

// fazendo calculo das barreiras, quando passaro passar 

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return horizontal && vertical
}

// fazendo a colisão quando passaro bater nas barreiras 
function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}


// representando a pontução do jogo e dando start no jogo 
function FlayppyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    // adicionando todos os elemetos na tela 
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    // iniciando o jogo
    this.start = () => {
        // loop do jogo 
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            // fazendo um teste se colidiu
            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador) // parando o jogo
            }
        }, 20)
    }
}

new FlayppyBird().start()

