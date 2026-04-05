document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('supplierForm');
    const suppliersBody = document.getElementById('suppliersBody');
    const emptyMsg = document.getElementById('emptyMsg');
    const messageDiv = document.getElementById('message');

    let suppliers = [];
    const API = window.location.origin;

    loadSuppliers();

    // Mask helpers
    const cnpjInput = document.getElementById('cnpj');
    const telefoneInput = document.getElementById('telefone');
    const cepInput = document.getElementById('cep');

    cnpjInput.addEventListener('input', () => {
        let v = cnpjInput.value.replace(/\D/g, '').slice(0, 14);
        v = v.replace(/^(\d{2})(\d)/, '$1.$2');
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
        v = v.replace(/(\d{4})(\d)/, '$1-$2');
        cnpjInput.value = v;
    });

    telefoneInput.addEventListener('input', () => {
        let v = telefoneInput.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 6) {
            v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        } else if (v.length > 2) {
            v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        } else {
            v = v.replace(/^(\d{0,2})/, '($1');
        }
        telefoneInput.value = v;
    });

    cepInput.addEventListener('input', () => {
        let v = cepInput.value.replace(/\D/g, '').slice(0, 8);
        v = v.replace(/^(\d{5})(\d)/, '$1-$2');
        cepInput.value = v;
    });

    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const certCheckboxes = document.querySelectorAll('input[name="certificacoes"]:checked');
        const certificacoes = Array.from(certCheckboxes).map(cb => cb.value);

        const supplier = {
            razaoSocial: document.getElementById('razaoSocial').value.trim(),
            nomeFantasia: document.getElementById('nomeFantasia').value.trim(),
            cnpj: cnpjInput.value.trim(),
            inscricaoEstadual: document.getElementById('inscricaoEstadual').value.trim(),
            segmento: document.getElementById('segmento').value,
            porte: document.getElementById('porte').value,
            email: document.getElementById('email').value.trim(),
            telefone: telefoneInput.value.trim(),
            cep: cepInput.value.trim(),
            cidade: document.getElementById('cidade').value.trim(),
            estado: document.getElementById('estado').value,
            certificacoes,
            politicaAmbiental: document.getElementById('politicaAmbiental').value.trim(),
        };

        if (!validateForm(supplier)) return;

        try {
            const res = await fetch(`${API}/api/fornecedores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplier)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar');
            await loadSuppliers();
            form.reset();
            showMessage('Fornecedor cadastrado com sucesso!', 'success');
        } catch (err) {
            showMessage(err.message, 'error');
        }
    });

    function validateForm(supplier) {
        if (!supplier.razaoSocial || !supplier.cnpj || !supplier.segmento || !supplier.porte || !supplier.email || !supplier.telefone) {
            showMessage('Preencha todos os campos obrigatórios.', 'error');
            return false;
        }
        if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(supplier.cnpj)) {
            showMessage('CNPJ inválido. Use o formato: 00.000.000/0000-00', 'error');
            return false;
        }
        return true;
    }

    async function loadSuppliers() {
        try {
            const res = await fetch(`${API}/api/fornecedores`);
            if (!res.ok) throw new Error('Erro ao carregar fornecedores');
            suppliers = await res.json();
            renderTable();
        } catch (err) {
            console.error('Failed to load suppliers:', err);
        }
    }

    function renderTable() {
        suppliersBody.innerHTML = '';
        emptyMsg.style.display = suppliers.length === 0 ? 'block' : 'none';

        suppliers.forEach((s) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(s.nome_fantasia || s.razao_social)}</td>
                <td>${escapeHtml(s.cnpj)}</td>
                <td>${getSegmentLabel(s.segmento)}</td>
                <td>${escapeHtml(s.email)}<br><small>${escapeHtml(s.telefone)}</small></td>
                <td><button class="btn-delete" data-id="${s.id}">Remover</button></td>
            `;
            suppliersBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.dataset.id);
                try {
                    const res = await fetch(`${API}/api/fornecedores/${id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Erro ao remover');
                    await loadSuppliers();
                    showMessage('Fornecedor removido.', 'success');
                } catch (err) {
                    showMessage(err.message, 'error');
                }
            });
        });
    }

    function getSegmentLabel(value) {
        const labels = {
            energia: 'Energia Renovável',
            construcao: 'Construção Sustentável',
            residuos: 'Gestão de Resíduos',
            agua: 'Tratamento de Água',
            agricultura: 'Agricultura Sustentável',
            transporte: 'Transporte Limpo',
            outro: 'Outro',
        };
        return labels[value] || value;
    }

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        clearTimeout(messageDiv._timeout);
        messageDiv._timeout = setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 4000);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
