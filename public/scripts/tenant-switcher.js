(async function() {
    // Only add to pages with a body
    if (!document.body) return;

    try {
        const res = await fetch('/api/tenant/list');
        if (!res.ok) return;
        const tenants = await res.json();

        const currentTenant = localStorage.getItem('tenantId') || 'default';

        const switcherDiv = document.createElement('div');
        switcherDiv.style.position = 'fixed';
        switcherDiv.style.bottom = '20px';
        switcherDiv.style.right = '20px';
        switcherDiv.style.zIndex = '9999';
        switcherDiv.style.backgroundColor = '#ffffff';
        switcherDiv.style.border = '1px solid #ccc';
        switcherDiv.style.borderRadius = '8px';
        switcherDiv.style.padding = '10px';
        switcherDiv.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        switcherDiv.style.display = 'flex';
        switcherDiv.style.alignItems = 'center';
        switcherDiv.style.gap = '10px';
        switcherDiv.style.fontFamily = 'system-ui, sans-serif';
        switcherDiv.style.fontSize = '14px';

        const label = document.createElement('label');
        label.innerText = 'Organization:';
        label.style.fontWeight = 'bold';

        const select = document.createElement('select');
        select.style.padding = '5px';
        select.style.borderRadius = '4px';
        
        tenants.forEach(t => {
            const option = document.createElement('option');
            option.value = t.id;
            option.innerText = t.name;
            if (t.id === currentTenant) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            const newTenant = e.target.value;
            localStorage.setItem('tenantId', newTenant);
            // Reload page to re-fetch data for the new tenant
            window.location.reload();
        });

        switcherDiv.appendChild(label);
        switcherDiv.appendChild(select);
        document.body.appendChild(switcherDiv);

    } catch (e) {
        console.error('Error loading tenant switcher', e);
    }
})();
