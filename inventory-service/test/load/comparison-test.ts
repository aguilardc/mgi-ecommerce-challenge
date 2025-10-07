import axios from 'axios';
import * as chalk from 'chalk';

interface TestResult {
  strategy: string;
  totalRequests: number;
  successfulReservations: number;
  failedReservations: number;
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  errors: number;
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const strategies = ['PESSIMISTIC', 'OPTIMISTIC', 'APPLICATION'];

async function resetProduct(productId: string, quantity: number) {
  console.log(`Resetting ${productId} to ${quantity} units...`);
  // Este endpoint debería existir para testing
  try {
    await axios.post(`${BASE_URL}/inventory/reset`, {
      productId,
      availableQuantity: quantity,
      reservedQuantity: 0
    });
  } catch (error) {
    console.warn('Reset endpoint not available, manual reset needed');
  }
}

async function testStrategy(
  strategy: string,
  productId: string,
  concurrentUsers: number,
  initialStock: number
): Promise<TestResult> {
  console.log(chalk.blue(`\n🧪 Testing ${strategy} with ${concurrentUsers} users and ${initialStock} stock`));

  await resetProduct(productId, initialStock);

  const responseTimes: number[] = [];
  const results = {
    strategy,
    totalRequests: concurrentUsers,
    successfulReservations: 0,
    failedReservations: 0,
    avgResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity,
    errors: 0
  };

  const requests = Array.from({ length: concurrentUsers }, async (_, i) => {
    const startTime = Date.now();

    try {
      const response = await axios.put(`${BASE_URL}/inventory/reserve`, {
        orderId: `ord_${strategy}_${Date.now()}_${i}`,
        productId,
        quantity: 1,
        lockingStrategy: strategy
      });

      const responseTime = Date.now() - startTime;
      responseTimes.push(responseTime);

      if (response.status === 200) {
        results.successfulReservations++;
        console.log(chalk.green(`✅ User ${i}: Reserved (${responseTime}ms)`));
      }

      return { success: true, responseTime, status: response.status };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      responseTimes.push(responseTime);

      if (error.response?.status === 409) {
        results.failedReservations++;
        console.log(chalk.yellow(`❌ User ${i}: No stock (${responseTime}ms)`));
      } else {
        results.errors++;
        console.log(chalk.red(`💥 User ${i}: Error - ${error.message}`));
      }

      return { success: false, responseTime, error: error.message };
    }
  });

  await Promise.all(requests);

  if (responseTimes.length > 0) {
    results.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    results.maxResponseTime = Math.max(...responseTimes);
    results.minResponseTime = Math.min(...responseTimes);
  }

  return results;
}

function printResults(results: TestResult[]) {
  console.log(chalk.bold('\n📊 RESULTS COMPARISON\n'));

  console.table(results.map(r => ({
    'Strategy': r.strategy,
    'Success': `${r.successfulReservations}/${r.totalRequests}`,
    'Failed': r.failedReservations,
    'Errors': r.errors,
    'Avg Time': `${r.avgResponseTime.toFixed(2)}ms`,
    'Min Time': `${r.minResponseTime.toFixed(2)}ms`,
    'Max Time': `${r.maxResponseTime.toFixed(2)}ms`
  })));

  // Análisis
  console.log(chalk.bold('\n📈 ANALYSIS\n'));

  const fastest = results.reduce((a, b) =>
    a.avgResponseTime < b.avgResponseTime ? a : b
  );
  console.log(chalk.green(`⚡ Fastest: ${fastest.strategy} (${fastest.avgResponseTime.toFixed(2)}ms avg)`));

  const mostReliable = results.reduce((a, b) =>
    a.errors < b.errors ? a : b
  );
  console.log(chalk.blue(`🛡️  Most Reliable: ${mostReliable.strategy} (${mostReliable.errors} errors)`));

  const mostConsistent = results.reduce((a, b) => {
    const rangeA = a.maxResponseTime - a.minResponseTime;
    const rangeB = b.maxResponseTime - b.minResponseTime;
    return rangeA < rangeB ? a : b;
  });
  console.log(chalk.magenta(`📏 Most Consistent: ${mostConsistent.strategy}`));

  // Verificar integridad de datos
  console.log(chalk.bold('\n🔍 DATA INTEGRITY CHECK\n'));
  results.forEach(r => {
    const totalOperations = r.successfulReservations + r.failedReservations + r.errors;
    const integrity = totalOperations === r.totalRequests ? '✅' : '❌';
    console.log(`${integrity} ${r.strategy}: ${totalOperations}/${r.totalRequests} operations accounted`);
  });
}

async function runAllTests() {
  console.log(chalk.bold.cyan('🚀 INVENTORY SERVICE LOCKING STRATEGY COMPARISON\n'));

  const allResults: TestResult[] = [];

  // Test 1: Race condition (10 users, 1 stock)
  console.log(chalk.bold.yellow('\n═══════════════════════════════════════'));
  console.log(chalk.bold.yellow('TEST 1: RACE CONDITION (10 users, 1 stock)'));
  console.log(chalk.bold.yellow('═══════════════════════════════════════'));

  for (const strategy of strategies) {
    const result = await testStrategy(strategy, 'prod_001', 10, 1);
    allResults.push(result);

    // Esperar un momento entre estrategias
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  printResults(allResults);

  // Test 2: High concurrency (25 users, 10 stock)
  console.log(chalk.bold.yellow('\n═══════════════════════════════════════'));
  console.log(chalk.bold.yellow('TEST 2: HIGH CONCURRENCY (25 users, 10 stock)'));
  console.log(chalk.bold.yellow('═══════════════════════════════════════'));

  const highConcurrencyResults: TestResult[] = [];

  for (const strategy of strategies) {
    const result = await testStrategy(strategy, 'prod_002', 25, 10);
    highConcurrencyResults.push(result);

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  printResults(highConcurrencyResults);

  // Recomendaciones
  console.log(chalk.bold('\n💡 RECOMMENDATIONS\n'));
  console.log('PESSIMISTIC: Best for high contention scenarios (flash sales)');
  console.log('OPTIMISTIC: Best for low contention with high throughput needs');
  console.log('APPLICATION: Best when you need custom lock logic or distributed systems');
}

runAllTests().catch(error => {
  console.error(chalk.red('Test failed:'), error);
  process.exit(1);
});