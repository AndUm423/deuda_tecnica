/**
 * Script de simulación de tráfico para verificar el comportamiento del monolito.
 * Ejecuta transacciones y muestra el estado del inventario y pedidos.
 */

const { process_order, inventory, processedOrders } = require('../src/legacy_order_service');

console.log('--- INICIO DE SIMULACIÓN DE TRÁFICO ---');
console.log('Inventario inicial:', JSON.stringify(inventory, null, 2));

// Transacción 1: Cliente VIP con tarjeta
const order1 = {
  customer_id: 'CUST-1001',
  user_type: 'VIP',
  coupon: 'DESC5',
  is_international: false,
  payment_method: 'CREDIT_CARD',
  card_number: '4111111111111111',
  items: [
    { id: 'PROD-001', qty: 2 } // 80 * 2 = 160
  ]
};

console.log('\n[1] Procesando Orden VIP...');
const res1 = process_order(order1);
console.log('Resultado 1:', res1);

// Transacción 2: Cliente internacional con pedido grande
const order2 = {
  customer_id: 'CUST-2002',
  user_type: 'REGULAR',
  coupon: '',
  is_international: true,
  payment_method: 'CREDIT_CARD',
  card_number: '4222222222222222',
  items: [
    { id: 'PROD-002', qty: 2 } // 320 * 2 = 640
  ]
};

console.log('\n[2] Procesando Orden Internacional...');
const res2 = process_order(order2);
console.log('Resultado 2:', res2);

// Transacción 3: Producto sin stock suficiente
const order3 = {
  customer_id: 'CUST-3003',
  user_type: 'REGULAR',
  payment_method: 'CASH',
  items: [
    { id: 'PROD-003', qty: 1 } // Stock es 0
  ]
};

console.log('\n[3] Procesando Orden con Producto Agotado...');
const res3 = process_order(order3);
console.log('Resultado 3 (debe fallar):', res3);

console.log('\n--- RESUMEN FINAL ---');
console.log('Total órdenes exitosas en memoria:', processedOrders.length);
console.log('Inventario restante:', JSON.stringify(inventory, null, 2));
