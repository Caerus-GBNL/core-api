# Dependency Injection Container (Awilix)

This directory contains the Dependency Injection (DI) container implementation using [Awilix](https://github.com/jeffijoe/awilix) for the microservice.

## Architecture

```
src/di/
├── container.js        # Awilix container initialization
├── bindings.js         # Service bindings configuration
├── index.js           # Export configured DI container
└── README.md          # This documentation
```

## Why Awilix?

Awilix is a production-ready, battle-tested DI container that provides:
- **Circular Dependency Detection** - Prevents infinite loops
- **Multiple Lifetime Management** - Singleton, scoped, and transient instances
- **Auto-Registration** - Automatic service discovery
- **Performance Optimized** - Minimal overhead
- **TypeScript Support** - Optional type safety
- **Extensive Error Handling** - Clear resolution error messages

## Container Features

- **Service Registration**: Register services with factory functions
- **Dependency Resolution**: Automatic dependency injection with destructuring
- **Lifecycle Management**: Singleton and instance-per-request patterns
- **Circular Dependency Detection**: Built-in protection against infinite loops
- **Error Handling**: Clear error messages for missing services and resolution failures

## Usage

### Basic Setup

The container is pre-configured and ready to use:

```javascript
const container = require('./di');

// Resolve a service
const basketUseCase = container.resolve('basketUseCase');
```

### Service Registration

Services are registered in `bindings.js`:

```javascript
const { asClass } = require('awilix');

container.register({
  // Repository as singleton - shared database connection
  basketRepository: asClass(BasketRepository).singleton(),
  
  // Use case as transient - new instance per request
  basketUseCase: asClass(BasketUseCase),
});
```

### Constructor Injection Pattern

Services must use destructuring in their constructors:

```javascript
class BasketUseCase {
  // Awilix injects dependencies as object properties
  constructor({ basketRepository }) {
    this.basketRepository = basketRepository;
  }
  
  createBasket(params) {
    return this.basketRepository.create(params);
  }
}
```

### Service Lifetimes

#### Singleton Pattern
```javascript
basketRepository: asClass(BasketRepository).singleton()
```
- **Single Instance**: Only one instance created and reused
- **Memory Efficient**: Reduces object creation overhead
- **Shared State**: All components get the same instance
- **Use Case**: Stateless services like repositories, database connections

#### Transient Pattern (Default)
```javascript
basketUseCase: asClass(BasketUseCase)
```
- **New Instance**: Creates fresh instance on each resolve
- **Isolated State**: Each request gets its own instance
- **Stateful Operations**: Prevents shared state between requests
- **Use Case**: Business logic that may hold request-specific data

## Controller Integration

Controllers resolve services from the container:

```javascript
const container = require('../di');

const basket = catchAsync(async (req, res) => {
  const basketUseCase = container.resolve('basketUseCase');
  const baskets = await basketUseCase.getBasketsByEmployeeId(965);
  res.status(httpStatus.OK).send(baskets);
});
```

## Migration from Manual DI

### Before (Manual Instantiation)
```javascript
const basket = catchAsync(async (req, res) => {
  const basketRepository = new BasketRepository();
  const basketUseCase = new BasketUseCase(basketRepository);
  // ... business logic
});
```

### After (Awilix DI Container)
```javascript
const container = require('../di');

const basket = catchAsync(async (req, res) => {
  const basketUseCase = container.resolve('basketUseCase');
  // ... business logic
});
```

## Testing

### Unit Tests
When testing services with dependencies, provide mock dependencies:

```javascript
// Test with real dependencies
const basketUseCase = new BasketUseCase({ 
  basketRepository: new BasketRepository() 
});

// Test with mocked dependencies
const mockRepository = { create: sinon.stub() };
const basketUseCase = new BasketUseCase({ 
  basketRepository: mockRepository 
});
```

### Container Tests
The container includes comprehensive tests covering:
- Service registration and resolution
- Singleton vs transient behavior
- Dependency injection patterns
- Error handling for missing services

Run DI tests:
```bash
npm test -- --grep "Awilix DI Container"
```

## Error Handling

Awilix provides clear error messages for common issues:

```javascript
// Missing service
container.resolve('unknownService');
// AwilixResolutionError: Could not resolve 'unknownService'

// Missing dependency
class Service {
  constructor({ missingDep }) { }
}
// AwilixResolutionError: Could not resolve 'missingDep'
```

## Adding New Services

1. **Create the Service Class**:
   ```javascript
   class NewService {
     constructor({ dependency1, dependency2 }) {
       this.dep1 = dependency1;
       this.dep2 = dependency2;
     }
   }
   ```

2. **Register in bindings.js**:
   ```javascript
   const { NewService } = require('../services');
   
   container.register({
     newService: asClass(NewService).singleton(), // or transient
   });
   ```

3. **Use in Controllers**:
   ```javascript
   const newService = container.resolve('newService');
   ```

## Best Practices

1. **Repository Pattern**: Use `singleton()` for repositories and data access
2. **Use Cases**: Use transient (default) for business logic
3. **Service Naming**: Use camelCase names matching class names
4. **Dependency Order**: Dependencies are auto-resolved, no ordering needed
5. **Constructor Destructuring**: Always use object destructuring in constructors
6. **Error Handling**: Let Awilix provide clear error messages
7. **Testing**: Inject real or mock dependencies based on test needs

## Advanced Features

### Conditional Registration
```javascript
container.register({
  service: process.env.NODE_ENV === 'test' 
    ? asClass(MockService) 
    : asClass(RealService)
});
```

### Factory Functions
```javascript
container.register({
  config: asFunction(() => ({
    apiUrl: process.env.API_URL,
    timeout: 5000
  })).singleton()
});
```

### Scoped Lifetimes
```javascript
// For request-scoped dependencies (advanced use case)
container.register({
  requestService: asClass(RequestService).scoped()
});
```

### Registration Types: `asValue` vs `asClass` vs `asFunction`

#### `asValue` - For Pre-configured Objects
Use when injecting existing instances, constructors, or pre-configured objects:

```javascript
const { Basket } = require('../models'); // Sequelize model constructor

container.register({
  basketModel: asValue(Basket), // Injects the model constructor itself
  config: asValue({ apiUrl: 'https://api.example.com' }),
  logger: asValue(winston.createLogger({ ... }))
});
```

**When to use `asValue`:**
- Sequelize/Mongoose model constructors
- Pre-configured instances (loggers, clients)
- Configuration objects
- Third-party library instances

#### `asClass` - For Dependency Injection Classes
Use for classes that need constructor dependency injection:

```javascript
container.register({
  basketRepository: asClass(BasketRepository).singleton(),
  basketUseCase: asClass(BasketUseCase)
});
```

**When to use `asClass`:**
- Repository classes
- Use case classes
- Service classes that need dependencies injected

#### `asFunction` - For Factory Functions
Use for dynamic creation or complex initialization:

```javascript
container.register({
  config: asFunction(() => ({
    apiUrl: process.env.API_URL,
    timeout: 5000
  })).singleton(),
  
  dynamicService: asFunction(({ config }) => {
    return new SomeService(config.apiUrl);
  })
});
```

#### Example: Sequelize Model Registration

```javascript
// ❌ Wrong - asClass tries to instantiate with 'new Basket(dependencies)'
basketModel: asClass(Basket)

// ✅ Correct - asValue injects the pre-configured model constructor
basketModel: asValue(Basket)

// Usage in Repository:
class BasketRepository {
  constructor({ basketModel }) {
    this.basketModel = basketModel; // Receives Sequelize model constructor
  }
  
  async create(data) {
    return await this.basketModel.create(data); // Uses Sequelize methods
  }
}
```

## Troubleshooting

### Common Issues

1. **Constructor not using destructuring**:
   ```javascript
   // ❌ Wrong
   constructor(basketRepository) { }
   
   // ✅ Correct
   constructor({ basketRepository }) { }
   ```

2. **Service name mismatch**:
   ```javascript
   // ❌ Wrong
   container.register({ BasketRepository: asClass(BasketRepository) });
   container.resolve('basketRepository'); // Case mismatch
   
   // ✅ Correct
   container.register({ basketRepository: asClass(BasketRepository) });
   container.resolve('basketRepository');
   ```

3. **Missing service registration**:
   - Ensure service is registered in `bindings.js`
   - Check for typos in service names

### Debug Tips

1. **List registered services**:
   ```javascript
   console.log(container.registrations);
   ```

2. **Check if service exists**:
   ```javascript
   console.log(container.hasRegistration('serviceName'));
   ```

## Migration Notes

When migrating from the custom DI container:
- Update constructor parameters to use destructuring
- Change service registration from custom format to Awilix format
- Update tests to provide dependencies as objects
- Remove manual dependency ordering (Awilix handles this automatically)