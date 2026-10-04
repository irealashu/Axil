export interface DocExample {
  id: string;
  title: string;
  category: 'Algorithms' | 'Systems' | 'Business Logic' | 'Finance';
  problem: string;
  description: string;
  code: string;
  expectedOutput: string;
  complexity: string;
  binaryBytes: number;
}

export const DOCUMENTATION_EXAMPLES: DocExample[] = [
  // 1. Algorithms & Mathematics
  {
    id: 'factorial',
    title: 'Factorial Accumulation',
    category: 'Algorithms',
    problem: 'Compute the factorial of a positive integer (5! = 120) using loop iteration and accumulator registers.',
    description: 'Initializes accumulator and counter in stack slots. Iterates through the @ loop aperture until counter reaches 0.',
    code: `5 > n\n1 > acc\nn | @ [ > 0 : acc | * n > acc | n | - 1 > n ]\nacc | $`,
    expectedOutput: '120\n',
    complexity: 'O(n) time · 2 stack slots',
    binaryBytes: 418
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Term Generator',
    category: 'Algorithms',
    problem: 'Calculate the 7th Fibonacci number (13) via two-pointer state transformation.',
    description: 'Maintains previous term in a and current term in b. Uses temporary store slots to shift state without variables leaking.',
    code: `0 > a\n1 > b\n6 > count\ncount | @ [ > 0 : a | + b > next | b > a | next > b | count | - 1 > count ]\nb | $`,
    expectedOutput: '13\n',
    complexity: 'O(n) time · 4 stack slots',
    binaryBytes: 472
  },
  {
    id: 'gcd',
    title: 'Euclidean GCD (Greatest Common Divisor)',
    category: 'Algorithms',
    problem: 'Find the greatest common divisor of 48 and 18 using Euclidean remainder reduction.',
    description: 'Repeatedly applies the modulo operator (%) until remainder is zero, leaving the GCD in the active stream register.',
    code: `48 > a\n18 > b\nb | @ [ > 0 : a | % b > rem | b > a | rem > b ]\na | $`,
    expectedOutput: '6\n',
    complexity: 'O(log(min(a,b))) · 3 stack slots',
    binaryBytes: 440
  },
  {
    id: 'collatz',
    title: 'Collatz Conjecture Step Discriminator',
    category: 'Algorithms',
    problem: 'Evaluate the next step in the 3n + 1 sequence for starting value 7.',
    description: 'Tests parity with modulo 2. Routes even numbers to division by 2, and odd numbers to 3n + 1 through the ? aperture.',
    code: `7 > n\nn | % 2 | ? [ == 0 : n | / 2 | $ | n | * 3 | + 1 | $ ]`,
    expectedOutput: '22\n',
    complexity: 'O(1) step decision',
    binaryBytes: 310
  },
  {
    id: 'power_doubler',
    title: 'Iterative Power Scaling (2^6)',
    category: 'Algorithms',
    problem: 'Compute integer powers of two by repeated multiplication in register RAX.',
    description: 'Streams multiplier operations through an iterative decrement loop, sinking the final result (64) to stdout.',
    code: `1 > res\n6 > exp\nexp | @ [ > 0 : res | * 2 > res | exp | - 1 > exp ]\nres | $`,
    expectedOutput: '64\n',
    complexity: 'O(exp) loop operations',
    binaryBytes: 396
  },
  {
    id: 'prime_divisibility',
    title: 'Prime Divisibility Trial',
    category: 'Algorithms',
    problem: 'Verify whether integer 29 is divisible by smallest prime base 2.',
    description: 'Evaluates modulus against 2. If remainder is zero, classifies as Composite; otherwise verifies trial non-divisibility.',
    code: `29 > candidate\ncandidate | % 2 | ? [ == 0 : "Composite\\n" | "Not divisible by 2\\n" ] | $`,
    expectedOutput: 'Not divisible by 2\n',
    complexity: 'O(1) trial remainder test',
    binaryBytes: 288
  },

  // 2. Business Logic & Data Validation
  {
    id: 'age_tier',
    title: 'Tiered Age Classifier',
    category: 'Business Logic',
    problem: 'Validate customer age and route to appropriate admission pricing category.',
    description: 'Compares age 15 against the adulthood threshold 18. Channels string descriptors through the branching aperture into the stdout sink.',
    code: `15 | ? [ < 18 : "Under 18\\n" | "Adult\\n" ] | $`,
    expectedOutput: 'Under 18\n',
    complexity: 'O(1) single branch evaluation',
    binaryBytes: 250
  },
  {
    id: 'discount_cap',
    title: 'Retail Discount & Price Floor Guard',
    category: 'Business Logic',
    problem: 'Apply a $25 seasonal discount to a $100 cart, ensuring price never dips below a $50 minimum threshold.',
    description: 'Subtracts discount, then evaluates the discounted head against the threshold. If lower, forces minimum price.',
    code: `100 | - 25 > price\nprice | ? [ < 50 : 50 | price ] | $`,
    expectedOutput: '75\n',
    complexity: 'O(1) conditional thresholding',
    binaryBytes: 295
  },
  {
    id: 'temp_warning',
    title: 'Thermal Threshold Warning Router',
    category: 'Business Logic',
    problem: 'Monitor sensor reading (85°C) and trigger high-temperature alarm string if exceeding 75°C.',
    description: 'Streams temperature through an inequality decision aperture, emitting either normal operating status or warning string.',
    code: `85 > temp\ntemp | ? [ > 75 : "ALERT: OVERHEAT\\n" | "NORMAL\\n" ] | $`,
    expectedOutput: 'ALERT: OVERHEAT\n',
    complexity: 'O(1) sensor trip evaluation',
    binaryBytes: 280
  },
  {
    id: 'credit_approval',
    title: 'Credit Score Pre-Qualification',
    category: 'Business Logic',
    problem: 'Evaluate consumer credit score (720) against prime threshold (700) for instant loan approval.',
    description: 'Performs integer comparison and sinks outcome descriptor directly to file descriptor 1.',
    code: `720 | ? [ >= 700 : "APPROVED\\n" | "REVIEW\\n" ] | $`,
    expectedOutput: 'APPROVED\n',
    complexity: 'O(1) branch dispatch',
    binaryBytes: 260
  },
  {
    id: 'loyalty_tier',
    title: 'SaaS Customer Loyalty Tiering',
    category: 'Business Logic',
    problem: 'Map account activity points (350) against vip status qualifier (300).',
    description: 'Channels high-volume clients into priority SLA routing with zero runtime wrapper overhead.',
    code: `350 > points\npoints | ? [ >= 300 : "GOLD TIER\\n" | "STANDARD TIER\\n" ] | $`,
    expectedOutput: 'GOLD TIER\n',
    complexity: 'O(1) status decision',
    binaryBytes: 274
  },

  // 3. Low-Level Systems & Kernel Interaction
  {
    id: 'direct_stdout',
    title: 'Direct Kernel Hello World',
    category: 'Systems',
    problem: 'Emit a raw UTF-8 string to standard output with zero standard C libraries or external wrappers.',
    description: 'Loads string pointer and 8-byte length prefix into RSI/RDX registers. Triggers Linux sys_write via machine instruction 0F 05.',
    code: `"Hello, World from Axil!\\n" | $`,
    expectedOutput: 'Hello, World from Axil!\n',
    complexity: 'O(1) direct Linux syscall',
    binaryBytes: 210
  },
  {
    id: 'exit_status',
    title: 'Error Code Arithmetic & Return Signaling',
    category: 'Systems',
    problem: 'Compute custom status flag (3 * 10 = 30) and emit as exit status code.',
    description: 'Demonstrates stack storage of status codes and arithmetic chaining before sink drainage.',
    code: `10 | * 3 > status\nstatus | $`,
    expectedOutput: '30\n',
    complexity: 'O(1) register accumulator',
    binaryBytes: 265
  },
  {
    id: 'stack_slots',
    title: 'Multi-Slot Scratchpad Management',
    category: 'Systems',
    problem: 'Allocate and coordinate 3 independent local variables ([RBP - 8], [RBP - 16], [RBP - 24]).',
    description: 'Demonstrates deterministic stack slots (10 > x, 20 > y, 30 > z) and quadword retrieval.',
    code: `10 > x\n20 > y\n30 > z\nx | + y | + z | $`,
    expectedOutput: '60\n',
    complexity: '3 stack frame slots · O(1)',
    binaryBytes: 345
  },
  {
    id: 'raw_parity',
    title: 'CPU Zero-Flag & Parity Detection',
    category: 'Systems',
    problem: 'Check 64-bit integer parity via cqo and idiv remainder testing.',
    description: 'Executes signed division by 2, tests remainder against 0, and sinks parity text directly to terminal.',
    code: `17 | % 2 | ? [ == 0 : "Even\\n" | "Odd\\n" ] | $`,
    expectedOutput: 'Odd\n',
    complexity: 'O(1) hardware division',
    binaryBytes: 262
  },
  {
    id: 'bitmask_flag',
    title: 'Kernel State Flag Extraction',
    category: 'Systems',
    problem: 'Extract lowest bit of telemetry bitmask (flags = 7) to check subsystem readiness.',
    description: 'Applies modulo arithmetic to extract the least significant bit, verifying active hardware flags.',
    code: `7 > flags\nflags | % 2 > bit0\nbit0 | ? [ == 1 : "FLAG_ACTIVE\\n" | "FLAG_MUTED\\n" ] | $`,
    expectedOutput: 'FLAG_ACTIVE\n',
    complexity: 'O(1) bit remainder extraction',
    binaryBytes: 284
  },
  {
    id: 'kinematic_stop',
    title: 'Kinematic Stopping Distance',
    category: 'Systems',
    problem: 'Calculate vehicle braking distance (d = v^2 / 2a) with speed 30 m/s and deceleration 10 m/s^2.',
    description: 'Computes velocity squared (900), divides by 2 * acceleration (20), yielding stopping distance 45 meters.',
    code: `30 > velocity\nvelocity | * velocity | / 20 > stopping_dist\nstopping_dist | $`,
    expectedOutput: '45\n',
    complexity: 'O(1) quadratic kinematic pipeline',
    binaryBytes: 320
  },
  {
    id: 'ohms_law',
    title: "Ohm's Law Circuit Impedance",
    category: 'Systems',
    problem: 'Compute internal resistance of circuit with 240V supply drawing 20A current.',
    description: 'Directly routes voltage head through current division aperture to determine resistance in ohms.',
    code: `240 > voltage\n20 > current\nvoltage | / current > resistance\nresistance | $`,
    expectedOutput: '12\n',
    complexity: 'O(1) hardware division',
    binaryBytes: 305
  },

  // 4. Financial & Quantitative Computing
  {
    id: 'compound_growth',
    title: 'Compound Interest Multiplier',
    category: 'Finance',
    problem: 'Calculate growth on a $1,000 principal at 10% annual yield over 3 periods.',
    description: 'Iterates through growth periods using integer percentages, accumulating compounding value in stack memory.',
    code: `1000 > principal\n3 > years\nyears | @ [ > 0 : principal | * 110 | / 100 > principal | years | - 1 > years ]\nprincipal | $`,
    expectedOutput: '1331\n',
    complexity: 'O(years) compounding loop',
    binaryBytes: 430
  },
  {
    id: 'tax_bracket',
    title: 'Marginal Income Tax Tiering',
    category: 'Finance',
    problem: 'Determine tax assessment on $60,000 income using progressive tier comparison.',
    description: 'Evaluates taxable base against the $50,000 bracket threshold, applying either 15% standard rate or 25% upper rate.',
    code: `60000 > income\nincome | ? [ > 50000 : income | * 25 | / 100 | $ | income | * 15 | / 100 | $ ]`,
    expectedOutput: '15000\n',
    complexity: 'O(1) branch rate computation',
    binaryBytes: 340
  },
  {
    id: 'net_proceeds',
    title: 'Merchant Fee & Net Proceeds Deductor',
    category: 'Finance',
    problem: 'Deduct a 3% merchant processing fee plus $1 flat gateway surcharge on a $500 sale.',
    description: 'Chains multiplication, division, and subtraction operators left-to-right to compute net settlement.',
    code: `500 > gross\ngross | * 3 | / 100 | + 1 > fee\ngross | - fee > net\nnet | $`,
    expectedOutput: '484\n',
    complexity: 'O(1) pipeline settlement',
    binaryBytes: 360
  },
  {
    id: 'currency_conversion',
    title: 'Foreign Exchange Scaling',
    category: 'Finance',
    problem: 'Convert $120 USD to EUR at base rate of 0.92 EUR per USD using integer basis points.',
    description: 'Multiplies by basis factor 92 and divides by 100, preventing floating-point truncation issues in bare metal.',
    code: `120 > usd\nusd | * 92 | / 100 > eur\neur | $`,
    expectedOutput: '110\n',
    complexity: 'O(1) basis points arithmetic',
    binaryBytes: 310
  }
];
