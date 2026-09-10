/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
   const { discount, sale_price, quantity } = purchase;
   const discountCoef = 1 - (discount / 100);
   return sale_price * quantity * discountCoef;

}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
     // @TODO: Расчет бонуса от позиции в рейтинге
    const { profit } = seller;

    if (index === 0) {
        return profit * 0.15;
    }

    else if (index === 1 || index === 2) {
        return profit * 0.10;
    }

    else if (index === total - 1) {
        return 0;
    }

    else {
        return profit * 0.05;
    }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных
    if (!data
        || typeof data !== 'object'
        || !Array.isArray(data.products)
        || !Array.isArray(data.sellers)
        || !Array.isArray(data.purchase_records)
        || data.products.length === 0
        || data.sellers.length === 0
        || data.purchase_records.length === 0
    ) {
        throw new Error('Invalid input data');
    }

    const { products, sellers, purchase_records } = data;

    // @TODO: Проверка наличия опций

    const { calculateRevenue, calculateBonus } = options || {};

    if (!calculateRevenue || !calculateBonus) {
        throw new Error('Missing required functions: calculateRevenue and calculateBonus');
    }

    if (typeof calculateRevenue !== 'function' || typeof calculateBonus !== 'function') {
        throw new Error('calculateRevenue and calculateBonus must be functions');
    }
    
   

    

    // @TODO: Подготовка промежуточных данных для сбора статистики

    const sellerStats = data.sellers.map(seller => ({
         id: seller.id,
            name: seller.first_name + ' ' + seller.last_name,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            products_sold: {}
    }));
    
      
   

    // @TODO: Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = {};
    const productIndex = {};

    sellerStats.forEach(seller => {
        sellerIndex[seller.id] = seller;
    });

    data.products.forEach(product => {
        productIndex[product.sku] = product;
    });

    // @TODO: Расчет выручки и прибыли для каждого продавца
    
    data.purchase_records.forEach(record => {
        const seller = sellerIndex[record.seller_id];

        seller.sales_count = seller.sales_count + 1;

        seller.revenue = seller.revenue + record.total_amount;

        record.items.forEach(item => {
            const product = productIndex[item.sku];

            const cost = product.purchase_price * item.quantity;

            const revenue = calculateRevenue(item, product);

            const profit = revenue - cost;

            seller.profit = seller.profit + profit;

            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] = seller.products_sold[item.sku] + item.quantity;
        });
    });

    // @TODO: Сортировка продавцов по прибыли
    sellerStats.sort((a,b) => b.profit - a.profit);

    // @TODO: Назначение премий на основе ранжирования
    const total = sellerStats.length;

    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, total, seller);

        seller.top_products = Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({ sku, quantity}))
            .sort((a,b) => b.quantity - a.quantity)
            .slice(0, 10);
    });
        // @TODO: Подготовка итоговой коллекции с нужными полями
        return sellerStats.map(seller => ({
            seller_id: seller.id,
            name: seller.name,
            revenue: +seller.revenue.toFixed(2),
            profit: +seller.profit.toFixed(2),
            sales_count: seller.sales_count,
            top_products: seller.top_products,
            bonus: +seller.bonus.toFixed(2)
        }));

    }