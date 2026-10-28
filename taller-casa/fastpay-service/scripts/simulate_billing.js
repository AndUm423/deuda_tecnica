/**
 * SIMULADOR DE TRÃFICO Y CONCURRENCIA - FASTPAY GLOBAL
 * Este script evidencia los efectos de la deuda tÃ©cnica:
 * 1. CondiciÃ³n de carrera por persistencia no atÃ³mica (Cobro duplicado).
 * 2. Bloqueo de concurrencia e inconsistencia de saldos.
 * 3. Errores de cÃ¡lculo en coma flotante.
 */

const billingEngine = require('../legacy/legacy_billing_engine');
const fs = require('fs');
const path = require('path');

const BACKUP_FILE = path.join(__dirname, '../data/subscriptions_backup.json');

async function runSimulation() {
  console.log('===============================================================');
  console.log('âš¡ INICIANDO SIMULACIÃ“N DE FACTURACIÃ“N CONCURRENTE (FASTPAY)');
  console.log('===============================================================');

  // Respaldar estado original para poder restaurarlo
  const originalData = billingEngine.getAllSubscriptions();
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(originalData, null, 2));

  const targetSubId = "sub_101"; // Carlos Mendoza - ENTERPRISE ($299.99 USD)
  console.log(`\nðŸŽ¯ Objetivo: Procesar cobro para la suscripciÃ³n [${targetSubId}]`);
  console.log(`ðŸ‘¤ Cliente: ${originalData.find(s => s.id === targetSubId).customerEmail}`);
  console.log(`ðŸ’° Saldo inicial: $${originalData.find(s => s.id === targetSubId).balance.toFixed(2)} USD`);

  console.log('\nðŸš€ Disparando 5 solicitudes de cobro casi simultÃ¡neas...');
  console.log('   (Simulando reintentos del webhook de Stripe + clic impaciente del usuario)\n');

  // Disparar llamadas asÃ­ncronas concurrentes sobre la misma funciÃ³n sÃ­ncrona/bloqueante
  const promises = [];
  for (let i = 1; i <= 5; i++) {
    promises.push(
      new Promise((resolve) => {
        // Ligero jitter de milisegundos para forzar entrelazado de lectura/escritura
        const delay = Math.floor(Math.random() * 15);
        setTimeout(() => {
          const startTime = Date.now();
          const result = billingEngine.processSubscriptionBilling(targetSubId, {
            promoCode: (i === 1 ? "FAST2026" : undefined)
          });
          const duration = Date.now() - startTime;
          resolve({ attempt: i, result, duration });
        }, delay);
      })
    );
  }

  const results = await Promise.all(promises);

  console.log('ðŸ“Š RESULTADOS DE LAS 5 PETICIONES:');
  console.log('---------------------------------------------------------------');
  let successfulCharges = 0;
  results.forEach(res => {
    if (res.result.success) {
      successfulCharges++;
      console.log(`âœ… [Intento #${res.attempt}] COBRO EXITOSO: $${res.result.breakdown.finalTotal.toFixed(4)} USD | Ref: ${res.result.transactionReference} (${res.duration}ms)`);
    } else {
      console.log(`âŒ [Intento #${res.attempt}] RECHAZADO: ${res.result.code} - ${res.result.msg}`);
    }
  });

  // Verificar estado en el archivo plano
  const updatedData = billingEngine.getAllSubscriptions();
  const targetUpdated = updatedData.find(s => s.id === targetSubId);

  console.log('\n===============================================================');
  console.log('ðŸ” EVIDENCIA FORENSE DE DEUDA TÃ‰CNICA:');
  console.log('===============================================================');
  console.log(`ðŸ“Œ Cobros procesados exitosamente: ${successfulCharges} de 5.`);
  console.log(`ðŸ’³ Saldo registrado en base de datos: $${targetUpdated.balance} USD`);
  console.log(`âš ï¸  Fecha Ãºltima facturaciÃ³n: ${targetUpdated.lastBilledAt}`);

  if (successfulCharges > 1) {
    console.log(`\nðŸš¨ ALERTA CRÃTICA: Â¡INCIDENCIA DE COBRO DUPLICADO/MÃšLTIPLE DETECTADA!`);
    console.log(`   Se realizaron ${successfulCharges} cobros al cliente por falta de idempotencia y control de transacciones.`);
    console.log(`   Costo para la empresa: Soporte al cliente, devoluciÃ³n bancaria ($15 fee) y reputaciÃ³n.`);
  }

  // Restaurar datos originales
  billingEngine.resetSubscriptions(originalData);
  if (fs.existsSync(BACKUP_FILE)) {
    fs.unlinkSync(BACKUP_FILE);
  }
  console.log('\n[INFO] Archivo subscriptions.json restaurado al estado base inicial.');
  console.log('===============================================================\n');
}

runSimulation();

