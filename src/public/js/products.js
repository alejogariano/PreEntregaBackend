document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    fetchProducts();
})

async function loadCategories() {
    const response = await fetch('/api/products/categories');
    const data = await response.json();
    const categoryDiv = document.getElementById('category');

    if (data.status === 'success') {
        categoryDiv.innerHTML = data.categories.map(category => `
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="category-${category}" value="${category}" onchange="fetchProducts()">
                <label class="form-check-label" for="category-${category}">${category}</label>
            </div>
        `).join('');
    }
}

async function fetchProducts(page = 1) {
    const limit = document.getElementById('limit').value;
    const sort = document.getElementById('sort').value;
    const query = document.getElementById('query').value;
    const categories = Array.from(document.querySelectorAll('.form-check-input:checked')).map(input => input.value);

    let url = `/api/products?limit=${limit}&page=${page}`;
    if (sort) url += `&sort=${sort}`;
    if (query) url += `&query=${query}`;
    if (categories.length > 0) url += `&categories=${categories.join(',')}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'success') {
            const productsDiv = document.getElementById('products');
            const paginationDiv = document.getElementById('pagination');
            const errorMessageDiv = document.getElementById('error-message');
            
            errorMessageDiv.style.display = 'none';
            productsDiv.innerHTML = data.payload.map(product => `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${product._id}</h5>
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">${product.description}</p>
                            <p class="card-text"><strong>Precio:</strong> ${product.price}</p>
                            <p class="card-text"><strong>Categoría:</strong> ${product.category}</p>
                            <p class="card-text"><strong>Disponibilidad:</strong> ${product.availability ? 'Disponible' : 'No disponible'}</p>
                            <button class="agregar-carrito" data-producto-id="${product._id}">Agregar al carrito</button>
                        </div>
                    </div>
                </div>
            `).join('');

            paginationDiv.innerHTML = `
                ${data.hasPrevPage ? `<li class="page-item"><a class="page-link" href="#" onclick="fetchProducts(${data.prevPage})">Anterior</a></li>` : ''}
                <li class="page-item disabled"><a class="page-link" href="#">Página ${data.page} de ${data.totalPages}</a></li>
                ${data.hasNextPage ? `<li class="page-item"><a class="page-link" href="#" onclick="fetchProducts(${data.nextPage})">Siguiente</a></li>` : ''}
            `;

            currentPage = page;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        const errorMessageDiv = document.getElementById('error-message');
        errorMessageDiv.textContent = error.message;
        errorMessageDiv.style.display = 'block';
        document.getElementById('products').innerHTML = '';
        document.getElementById('pagination').innerHTML = '';
    }
}


document.querySelectorAll('.agregar-carrito').forEach(button => {
    button.addEventListener('click', async (event) => {
        const productId = button.dataset.productId;
        const cartId = '{{cartId}}'
        try {
            // Hacer una solicitud al servidor para agregar el producto al carrito
            const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Manejar la respuesta del servidor
            if (response.ok) {
                // El producto se agregó correctamente al carrito
                alert('Producto agregado al carrito.');
            } else {
                // Ocurrió un error al agregar el producto al carrito
                alert('Error al agregar el producto al carrito.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar la solicitud.');
        }
    });
})