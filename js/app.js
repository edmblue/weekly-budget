/* Variables */

const formularioInicial = document.querySelector('#formulario-inicial');
const valorInicialInput = document.querySelector('#valor-inicial');
const formularioGastos = document.querySelector('#agregar-gasto');
const nombreGasto = document.querySelector('#gasto');
const cantidadGasto = document.querySelector('#cantidad');
let valorInicial = '';
const listaGastos = document.querySelector('.list-group');
const restante = document.querySelector('#restante');

// classes

/**  Interfaz  **/

class UI {
  mostrarAlerta(mensaje, tipo) {
    const contenidoPrincipal = document.querySelector('.contenido-principal');
    const divAlerta = document.createElement('div');
    divAlerta.classList.add('alert', 'text-center', 'mt-3');
    divAlerta.textContent = mensaje;
    if (tipo == 'error') {
      divAlerta.classList.add('alert-danger');
      divAlerta.classList.remove('alert-sucess');
    } else {
      divAlerta.classList.remove('alert-danger');
      divAlerta.classList.add('alert-success');
    }

    contenidoPrincipal.appendChild(divAlerta);

    setTimeout(() => {
      divAlerta.remove();
    }, 1500);
  }

  cargarApp(valor) {
    formularioInicial.remove();
    document.querySelectorAll('.col').forEach((e) => {
      e.classList.remove('d-none');
    });

    document.querySelector('#total').textContent = valor;
    restante.textContent = valor;
  }

  mostrarGastos(listaGastosObj) {
    this.vaciarGastos();
    listaGastosObj.forEach((itemLista) => {
      const { nombre, cantidad, id } = itemLista;
      const row = document.createElement('li');
      row.className =
        'list-group-item d-flex justify-content-between align-items-center';

      row.innerHTML = `
      ${nombre}
      <span class="badge badge-primary badge-pill">$ ${cantidad}</span>
      `;

      const btnBorrar = document.createElement('button');
      btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
      btnBorrar.textContent = 'Borrar';
      btnBorrar.dataset.id = id;
      row.appendChild(btnBorrar);

      listaGastos.appendChild(row);
    });
  }

  vaciarGastos() {
    while (listaGastos.firstChild) {
      listaGastos.removeChild(listaGastos.firstChild);
    }
  }

  actualizarRestante(total, valor) {
    restante.textContent = valor;
    formularioGastos.querySelector('button[type="submit"]').disabled = false;

    const restanteDiv = document.querySelector('.restante');

    if (valor <= 0) {
      this.mostrarAlerta('Excediste tu presupuesto', 'error');
      formularioGastos.querySelector('button[type="submit"]').disabled = true;
    }

    if (total * 0.25 > valor) {
      restanteDiv.classList.remove('alert-success');
      restanteDiv.classList.remove('alert-warning');
      restanteDiv.classList.add('alert-danger');
    } else if (total * 0.5 > valor) {
      restanteDiv.classList.remove('alert-danger');
      restanteDiv.classList.remove('alert-success');
      restanteDiv.classList.add('alert-warning');
    } else {
      restanteDiv.classList.remove('alert-danger');
      restanteDiv.classList.remove('alert-warning');
      restanteDiv.classList.add('alert-success');
    }
  }

  borrarItem(listaGastoObj, id) {
    let listaGastosActualizados = listaGastoObj.filter(
      (listaItem) => listaItem.id != id
    );
    this.mostrarGastos(listaGastosActualizados);
    return listaGastosActualizados;
  }
}

/** Financias Usuario **/

class finanzasUsuario {
  constructor(cantidad) {
    this.presupuesto = cantidad;
    this.restante = cantidad;
    this.listaGastos = [];
  }

  agregarGastos(gasto) {
    this.listaGastos = [...this.listaGastos, gasto];
  }

  calcularRestante() {
    let totalResta = this.listaGastos.reduce(
      (total, listItem) => total - listItem.cantidad,
      this.presupuesto
    );
    this.restante = totalResta;
    return totalResta;
  }

  devolverValor(id) {
    this.listaGastos.forEach((itemList) => {
      if (itemList.id == id) {
        this.restante += itemList.cantidad;
      }
    });

    return this.restante;
  }
}

//instancias

const ui = new UI();
let finanzas;

/** eventListeners **/

callEventListeners();

function callEventListeners() {
  formularioInicial.addEventListener('submit', validarFormularioInicial);
  formularioGastos.addEventListener('submit', calcularGastos);
  listaGastos.addEventListener('click', borrarItemLista);
}

/** Borrar items  **/

function borrarItemLista(e) {
  ui.actualizarRestante(
    valorInicial,
    finanzas.devolverValor(e.target.dataset.id)
  );

  if (e.target.classList.contains('borrar-gasto')) {
    finanzas.listaGastos = ui.borrarItem(
      finanzas.listaGastos,
      e.target.dataset.id
    );
  }
}

function validarFormularioInicial(e) {
  e.preventDefault();

  valorInicial = Number(valorInicialInput.value);

  if (valorInicial == '' || isNaN(valorInicial) || valorInicial <= 0) {
    ui.mostrarAlerta('Ingresaste un valor invalido', 'error');
    return;
  }

  ui.cargarApp(valorInicial);

  finanzas = new finanzasUsuario(valorInicial);
}

function calcularGastos(e) {
  e.preventDefault();

  if (
    nombreGasto.value == '' ||
    cantidadGasto.value == '' ||
    isNaN(cantidadGasto.value)
  ) {
    ui.mostrarAlerta('Campos invalidos', 'error');
    return;
  }

  ui.mostrarAlerta('Gasto añadido', 'correcto');

  const gasto = {
    nombre: nombreGasto.value,
    cantidad: Number(cantidadGasto.value),
    id: Date.now(),
  };

  finanzas.agregarGastos(gasto);

  ui.mostrarGastos(finanzas.listaGastos);

  ui.actualizarRestante(valorInicial, finanzas.calcularRestante());

  formularioGastos.reset();
}
