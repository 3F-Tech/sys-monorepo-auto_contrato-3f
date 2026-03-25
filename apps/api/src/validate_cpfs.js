
function isValidCPF(cpf) {
    if (typeof cpf !== 'string') return false;
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    const cpfDigits = cpf.split('').map(el => +el);
    const rest = (count) => {
        return ((cpfDigits.slice(0, count - 12).reduce((soma, el, index) => (soma + el * (count - index)), 0) * 10) % 11) % 10;
    };
    return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10];
}

const cpfs = [
    { name: 'NATI', value: '013.266.710-06' },
    { name: 'LUIS', value: '023.275.400-46' },
    { name: 'LETI', value: '025.189.220-40' },
    { name: 'ERIKA', value: '350.251.648-00' }
];

cpfs.forEach(c => {
    console.log(`${c.name} (${c.value}): ${isValidCPF(c.value) ? 'VALID' : 'INVALID'}`);
});
