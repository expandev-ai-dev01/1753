/**
 * Database Migration
 * Generated: 2025-11-17T17:02:06.064Z
 * Timestamp: 20251117_170206
 *
 * This migration includes:
 * - Schema structures (tables, indexes, constraints)
 * - Initial data
 * - Stored procedures
 *
 * Note: This file is automatically executed by the migration runner
 * on application startup in Azure App Service.
 */

-- Set options for better SQL Server compatibility
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET ANSI_WARNINGS ON;
SET NUMERIC_ROUNDABORT OFF;
GO

PRINT 'Starting database migration...';
PRINT 'Timestamp: 20251117_170206';
GO


-- ============================================
-- STRUCTURE
-- Database schemas, tables, indexes, and constraints
-- ============================================

-- File: functional/_structure.sql
/**
 * @schema functional
 * Business logic schema for StockBox inventory management
 */
CREATE SCHEMA [functional];
GO

/**
 * @table {stockMovement} Stock movement transaction log
 * @multitenancy true
 * @softDelete false
 * @alias stcMov
 */
CREATE TABLE [functional].[stockMovement] (
  [idStockMovement] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [idProduct] INTEGER NOT NULL,
  [idUser] INTEGER NOT NULL,
  [movementType] INTEGER NOT NULL,
  [quantity] NUMERIC(18, 6) NOT NULL,
  [unitCost] NUMERIC(18, 6) NULL,
  [reason] NVARCHAR(255) NULL,
  [referenceDocument] VARCHAR(50) NULL,
  [batchNumber] VARCHAR(30) NULL,
  [expirationDate] DATE NULL,
  [location] NVARCHAR(100) NULL,
  [dateCreated] DATETIME2 NOT NULL DEFAULT (GETUTCDATE())
);
GO

/**
 * @primaryKey {pkStockMovement}
 * @keyType Object
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [pkStockMovement] PRIMARY KEY CLUSTERED ([idStockMovement]);
GO

/**
 * @foreignKey {fkStockMovement_Account} Account isolation for multi-tenancy
 * @target {subscription.account}
 * @tenancy true
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [fkStockMovement_Account] FOREIGN KEY ([idAccount])
REFERENCES [subscription].[account]([idAccount]);
GO

/**
 * @check {chkStockMovement_MovementType} Movement type validation
 * @enum {0} ENTRADA - Stock entry
 * @enum {1} SAIDA - Stock exit
 * @enum {2} AJUSTE - Stock adjustment
 * @enum {3} CRIACAO - Product creation
 * @enum {4} EXCLUSAO - Product deletion
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [chkStockMovement_MovementType] CHECK ([movementType] BETWEEN 0 AND 4);
GO

/**
 * @index {ixStockMovement_Account} Account isolation index
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Account]
ON [functional].[stockMovement]([idAccount]);
GO

/**
 * @index {ixStockMovement_Product} Product lookup optimization
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Product]
ON [functional].[stockMovement]([idAccount], [idProduct]);
GO

/**
 * @index {ixStockMovement_DateCreated} Chronological query optimization
 * @type Performance
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_DateCreated]
ON [functional].[stockMovement]([idAccount], [dateCreated] DESC)
INCLUDE ([idProduct], [movementType], [quantity]);
GO

/**
 * @index {ixStockMovement_User} User activity tracking
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_User]
ON [functional].[stockMovement]([idAccount], [idUser]);
GO

/**
 * @index {ixStockMovement_MovementType} Movement type filtering
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_MovementType]
ON [functional].[stockMovement]([idAccount], [movementType]);
GO


-- ============================================
-- STORED PROCEDURES
-- Database stored procedures and functions
-- ============================================

-- File: functional/stockMovement/spStockBalanceGet.sql
/**
 * @summary
 * Calculates current stock balance for a product including quantity,
 * total value, average cost, and last movement date.
 * Optionally calculates balance at a specific reference date.
 * 
 * @procedure spStockBalanceGet
 * @schema functional
 * @type stored-procedure
 * 
 * @endpoints
 * - GET /api/v1/internal/stock-balance/:idProduct
 * 
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 * 
 * @param {INT} idProduct
 *   - Required: Yes
 *   - Description: Product identifier
 * 
 * @param {DATE} referenceDate
 *   - Required: No
 *   - Description: Calculate balance at this date (default: current date)
 * 
 * @returns {StockBalance} Current stock balance information
 * 
 * @testScenarios
 * - Get current balance for product with movements
 * - Get balance at specific past date
 * - Get balance for product without movements
 * - Invalid product reference
 * - Invalid reference date
 */
CREATE OR ALTER PROCEDURE [functional].[spStockBalanceGet]
  @idAccount INTEGER,
  @idProduct INTEGER,
  @referenceDate DATE = NULL
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {parameterRequired}
   */
  IF (@idAccount IS NULL)
  BEGIN
    ;THROW 51000, 'idAccountRequired', 1;
  END;

  IF (@idProduct IS NULL)
  BEGIN
    ;THROW 51000, 'idProductRequired', 1;
  END;

  /**
   * @validation Product existence validation
   * @throw {productDoesntExist}
   */
  IF NOT EXISTS (
    SELECT 1
    FROM [functional].[product] prd
    WHERE prd.[idProduct] = @idProduct
      AND prd.[idAccount] = @idAccount
  )
  BEGIN
    ;THROW 51000, 'productDoesntExist', 1;
  END;

  /**
   * @remarks Set default reference date to current date
   */
  IF (@referenceDate IS NULL)
  BEGIN
    SET @referenceDate = CAST(GETUTCDATE() AS DATE);
  END;

  /**
   * @rule {fn-order-processing} Calculate stock balance with value and average cost
   */
  WITH [MovementSummary] AS (
    SELECT
      SUM(stcMov.[quantity]) AS [currentQuantity],
      SUM(
        CASE
          WHEN stcMov.[movementType] IN (0, 3) THEN stcMov.[quantity] * ISNULL(stcMov.[unitCost], 0)
          WHEN stcMov.[movementType] = 2 AND stcMov.[quantity] > 0 THEN stcMov.[quantity] * ISNULL(stcMov.[unitCost], 0)
          ELSE 0
        END
      ) AS [totalValue],
      MAX(stcMov.[dateCreated]) AS [lastMovementDate]
    FROM [functional].[stockMovement] stcMov
    WHERE stcMov.[idAccount] = @idAccount
      AND stcMov.[idProduct] = @idProduct
      AND CAST(stcMov.[dateCreated] AS DATE) <= @referenceDate
  )
  /**
   * @output {StockBalance, 1, 1}
   * @column {INT} idProduct - Product identifier
   * @column {NUMERIC} currentQuantity - Current stock quantity
   * @column {NUMERIC} totalValue - Total stock value
   * @column {NUMERIC} averageCost - Average unit cost
   * @column {DATETIME2} lastMovementDate - Last movement date
   * @column {DATE} referenceDate - Reference date for calculation
   */
  SELECT
    @idProduct AS [idProduct],
    ISNULL(movSum.[currentQuantity], 0) AS [currentQuantity],
    ISNULL(movSum.[totalValue], 0) AS [totalValue],
    CASE
      WHEN ISNULL(movSum.[currentQuantity], 0) > 0 THEN ISNULL(movSum.[totalValue], 0) / movSum.[currentQuantity]
      ELSE 0
    END AS [averageCost],
    movSum.[lastMovementDate],
    @referenceDate AS [referenceDate]
  FROM [MovementSummary] movSum;
END;
GO

-- File: functional/stockMovement/spStockMovementCreate.sql
/**
 * @summary
 * Creates a new stock movement transaction with comprehensive validation.
 * Validates business rules including stock availability for exits,
 * required fields based on movement type, and data consistency.
 * 
 * @procedure spStockMovementCreate
 * @schema functional
 * @type stored-procedure
 * 
 * @endpoints
 * - POST /api/v1/internal/stock-movement
 * 
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 * 
 * @param {INT} idUser
 *   - Required: Yes
 *   - Description: User performing the movement
 * 
 * @param {INT} idProduct
 *   - Required: Yes
 *   - Description: Product being moved
 * 
 * @param {INT} movementType
 *   - Required: Yes
 *   - Description: Type of movement (0=ENTRADA, 1=SAIDA, 2=AJUSTE, 3=CRIACAO, 4=EXCLUSAO)
 * 
 * @param {NUMERIC(18,6)} quantity
 *   - Required: Yes
 *   - Description: Quantity being moved
 * 
 * @param {NUMERIC(18,6)} unitCost
 *   - Required: No
 *   - Description: Unit cost for the movement
 * 
 * @param {NVARCHAR(255)} reason
 *   - Required: No (Yes for AJUSTE and EXCLUSAO)
 *   - Description: Reason for the movement
 * 
 * @param {VARCHAR(50)} referenceDocument
 *   - Required: No
 *   - Description: Reference document number
 * 
 * @param {VARCHAR(30)} batchNumber
 *   - Required: No
 *   - Description: Batch number
 * 
 * @param {DATE} expirationDate
 *   - Required: No
 *   - Description: Product expiration date
 * 
 * @param {NVARCHAR(100)} location
 *   - Required: No
 *   - Description: Storage location
 * 
 * @returns {INT} idStockMovement - Created movement identifier
 * 
 * @testScenarios
 * - Valid ENTRADA movement with all parameters
 * - Valid SAIDA movement with stock availability check
 * - Valid AJUSTE movement with required reason
 * - Valid CRIACAO movement for new product
 * - Valid EXCLUSAO movement with required reason
 * - Invalid product reference
 * - Invalid movement type
 * - SAIDA with insufficient stock
 * - AJUSTE without reason
 * - EXCLUSAO without reason
 * - Invalid quantity for movement type
 */
CREATE OR ALTER PROCEDURE [functional].[spStockMovementCreate]
  @idAccount INTEGER,
  @idUser INTEGER,
  @idProduct INTEGER,
  @movementType INTEGER,
  @quantity NUMERIC(18, 6),
  @unitCost NUMERIC(18, 6) = NULL,
  @reason NVARCHAR(255) = NULL,
  @referenceDocument VARCHAR(50) = NULL,
  @batchNumber VARCHAR(30) = NULL,
  @expirationDate DATE = NULL,
  @location NVARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {parameterRequired}
   */
  IF (@idAccount IS NULL)
  BEGIN
    ;THROW 51000, 'idAccountRequired', 1;
  END;

  IF (@idUser IS NULL)
  BEGIN
    ;THROW 51000, 'idUserRequired', 1;
  END;

  IF (@idProduct IS NULL)
  BEGIN
    ;THROW 51000, 'idProductRequired', 1;
  END;

  IF (@movementType IS NULL)
  BEGIN
    ;THROW 51000, 'movementTypeRequired', 1;
  END;

  IF (@quantity IS NULL)
  BEGIN
    ;THROW 51000, 'quantityRequired', 1;
  END;

  /**
   * @validation Movement type validation
   * @throw {invalidMovementType}
   */
  IF (@movementType NOT BETWEEN 0 AND 4)
  BEGIN
    ;THROW 51000, 'invalidMovementType', 1;
  END;

  /**
   * @validation Product existence validation
   * @throw {productDoesntExist}
   */
  IF NOT EXISTS (
    SELECT 1
    FROM [functional].[product] prd
    WHERE prd.[idProduct] = @idProduct
      AND prd.[idAccount] = @idAccount
      AND prd.[deleted] = 0
  )
  BEGIN
    ;THROW 51000, 'productDoesntExist', 1;
  END;

  /**
   * @rule {fn-order-processing} Quantity validation based on movement type
   * @throw {invalidQuantityForMovementType}
   */
  IF (@movementType IN (0, 3) AND @quantity <= 0)
  BEGIN
    ;THROW 51000, 'quantityMustBePositiveForEntryOrCreation', 1;
  END;

  IF (@movementType = 1 AND @quantity >= 0)
  BEGIN
    ;THROW 51000, 'quantityMustBeNegativeForExit', 1;
  END;

  IF (@movementType = 4 AND @quantity <> 0)
  BEGIN
    ;THROW 51000, 'quantityMustBeZeroForDeletion', 1;
  END;

  /**
   * @rule {fn-order-processing} Reason required for AJUSTE and EXCLUSAO
   * @throw {reasonRequired}
   */
  IF (@movementType IN (2, 4) AND (@reason IS NULL OR LEN(LTRIM(RTRIM(@reason))) = 0))
  BEGIN
    ;THROW 51000, 'reasonRequiredForAdjustmentOrDeletion', 1;
  END;

  /**
   * @rule {fn-order-processing} Expiration date validation for ENTRADA and CRIACAO
   * @throw {expirationDateMustBeFuture}
   */
  IF (@movementType IN (0, 3) AND @expirationDate IS NOT NULL AND @expirationDate <= CAST(GETUTCDATE() AS DATE))
  BEGIN
    ;THROW 51000, 'expirationDateMustBeFuture', 1;
  END;

  /**
   * @rule {fn-order-processing} Unit cost validation
   * @throw {unitCostMustBeNonNegative}
   */
  IF (@unitCost IS NOT NULL AND @unitCost < 0)
  BEGIN
    ;THROW 51000, 'unitCostMustBeNonNegative', 1;
  END;

  /**
   * @rule {fn-order-processing} Stock availability check for SAIDA
   * @throw {insufficientStock}
   */
  IF (@movementType = 1)
  BEGIN
    DECLARE @currentStock NUMERIC(18, 6);

    SELECT @currentStock = ISNULL(SUM(stcMov.[quantity]), 0)
    FROM [functional].[stockMovement] stcMov
    WHERE stcMov.[idAccount] = @idAccount
      AND stcMov.[idProduct] = @idProduct;

    IF (@currentStock + @quantity < 0)
    BEGIN
      ;THROW 51000, 'insufficientStock', 1;
    END;
  END;

  BEGIN TRY
    /**
     * @rule {be-transaction-control-pattern} Transaction for data integrity
     */
    BEGIN TRAN;

      DECLARE @idStockMovement INTEGER;

      INSERT INTO [functional].[stockMovement] (
        [idAccount],
        [idProduct],
        [idUser],
        [movementType],
        [quantity],
        [unitCost],
        [reason],
        [referenceDocument],
        [batchNumber],
        [expirationDate],
        [location],
        [dateCreated]
      )
      VALUES (
        @idAccount,
        @idProduct,
        @idUser,
        @movementType,
        @quantity,
        @unitCost,
        @reason,
        @referenceDocument,
        @batchNumber,
        @expirationDate,
        @location,
        GETUTCDATE()
      );

      SET @idStockMovement = SCOPE_IDENTITY();

      /**
       * @output {CreatedMovement, 1, 1}
       * @column {INT} idStockMovement - Created movement identifier
       */
      SELECT @idStockMovement AS [idStockMovement];

    COMMIT TRAN;
  END TRY
  BEGIN CATCH
    ROLLBACK TRAN;
    THROW;
  END CATCH;
END;
GO

-- File: functional/stockMovement/spStockMovementHistoryGet.sql
/**
 * @summary
 * Retrieves complete movement history for a specific product
 * with running balance calculation and optional filtering.
 * 
 * @procedure spStockMovementHistoryGet
 * @schema functional
 * @type stored-procedure
 * 
 * @endpoints
 * - GET /api/v1/internal/stock-movement/history/:idProduct
 * 
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 * 
 * @param {INT} idProduct
 *   - Required: Yes
 *   - Description: Product identifier
 * 
 * @param {DATE} startDate
 *   - Required: No
 *   - Description: Filter start date
 * 
 * @param {DATE} endDate
 *   - Required: No
 *   - Description: Filter end date
 * 
 * @param {INT} movementType
 *   - Required: No
 *   - Description: Filter by movement type
 * 
 * @returns {MovementHistory} Complete movement history with balances
 * 
 * @testScenarios
 * - Get complete history for product
 * - Filter history by date range
 * - Filter history by movement type
 * - Combined filters
 * - Invalid product reference
 * - Invalid date range
 */
CREATE OR ALTER PROCEDURE [functional].[spStockMovementHistoryGet]
  @idAccount INTEGER,
  @idProduct INTEGER,
  @startDate DATE = NULL,
  @endDate DATE = NULL,
  @movementType INTEGER = NULL
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {parameterRequired}
   */
  IF (@idAccount IS NULL)
  BEGIN
    ;THROW 51000, 'idAccountRequired', 1;
  END;

  IF (@idProduct IS NULL)
  BEGIN
    ;THROW 51000, 'idProductRequired', 1;
  END;

  /**
   * @validation Product existence validation
   * @throw {productDoesntExist}
   */
  IF NOT EXISTS (
    SELECT 1
    FROM [functional].[product] prd
    WHERE prd.[idProduct] = @idProduct
      AND prd.[idAccount] = @idAccount
  )
  BEGIN
    ;THROW 51000, 'productDoesntExist', 1;
  END;

  /**
   * @validation Date range validation
   * @throw {invalidDateRange}
   */
  IF (@startDate IS NOT NULL AND @endDate IS NOT NULL AND @endDate < @startDate)
  BEGIN
    ;THROW 51000, 'endDateMustBeGreaterThanOrEqualToStartDate', 1;
  END;

  /**
   * @validation Movement type validation
   * @throw {invalidMovementType}
   */
  IF (@movementType IS NOT NULL AND @movementType NOT BETWEEN 0 AND 4)
  BEGIN
    ;THROW 51000, 'invalidMovementType', 1;
  END;

  /**
   * @output {MovementHistory, n, n}
   * @column {INT} idStockMovement - Movement identifier
   * @column {INT} movementType - Movement type code
   * @column {NUMERIC} quantity - Movement quantity
   * @column {NUMERIC} unitCost - Unit cost
   * @column {NVARCHAR} reason - Movement reason
   * @column {VARCHAR} referenceDocument - Reference document
   * @column {VARCHAR} batchNumber - Batch number
   * @column {DATE} expirationDate - Expiration date
   * @column {NVARCHAR} location - Storage location
   * @column {DATETIME2} dateCreated - Movement date
   * @column {INT} idUser - User identifier
   * @column {NUMERIC} runningBalance - Balance after this movement
   */
  SELECT
    stcMov.[idStockMovement],
    stcMov.[movementType],
    stcMov.[quantity],
    stcMov.[unitCost],
    stcMov.[reason],
    stcMov.[referenceDocument],
    stcMov.[batchNumber],
    stcMov.[expirationDate],
    stcMov.[location],
    stcMov.[dateCreated],
    stcMov.[idUser],
    SUM(stcMov.[quantity]) OVER (
      ORDER BY stcMov.[dateCreated], stcMov.[idStockMovement]
      ROWS UNBOUNDED PRECEDING
    ) AS [runningBalance]
  FROM [functional].[stockMovement] stcMov
  WHERE stcMov.[idAccount] = @idAccount
    AND stcMov.[idProduct] = @idProduct
    AND (@startDate IS NULL OR CAST(stcMov.[dateCreated] AS DATE) >= @startDate)
    AND (@endDate IS NULL OR CAST(stcMov.[dateCreated] AS DATE) <= @endDate)
    AND (@movementType IS NULL OR stcMov.[movementType] = @movementType)
  ORDER BY
    stcMov.[dateCreated],
    stcMov.[idStockMovement];
END;
GO

-- File: functional/stockMovement/spStockMovementList.sql
/**
 * @summary
 * Lists stock movements with comprehensive filtering and ordering options.
 * Supports filtering by date range, movement type, product, and user.
 * Calculates running balance for each movement.
 * 
 * @procedure spStockMovementList
 * @schema functional
 * @type stored-procedure
 * 
 * @endpoints
 * - GET /api/v1/internal/stock-movement
 * 
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy
 * 
 * @param {DATE} startDate
 *   - Required: No
 *   - Description: Filter start date
 * 
 * @param {DATE} endDate
 *   - Required: No
 *   - Description: Filter end date
 * 
 * @param {INT} movementType
 *   - Required: No
 *   - Description: Filter by movement type
 * 
 * @param {INT} idProduct
 *   - Required: No
 *   - Description: Filter by product
 * 
 * @param {INT} idUser
 *   - Required: No
 *   - Description: Filter by user
 * 
 * @param {VARCHAR(20)} orderBy
 *   - Required: No
 *   - Description: Sort order (DATE_DESC, DATE_ASC, PRODUCT, TYPE, QUANTITY)
 * 
 * @param {INT} limitRecords
 *   - Required: No
 *   - Description: Maximum records to return (1-1000)
 * 
 * @returns {MovementList} List of movements with calculated balances
 * 
 * @testScenarios
 * - List all movements without filters
 * - Filter by date range
 * - Filter by movement type
 * - Filter by product
 * - Filter by user
 * - Combined filters
 * - Different sort orders
 * - Limit records
 * - Invalid date range
 * - Invalid limit
 */
CREATE OR ALTER PROCEDURE [functional].[spStockMovementList]
  @idAccount INTEGER,
  @startDate DATE = NULL,
  @endDate DATE = NULL,
  @movementType INTEGER = NULL,
  @idProduct INTEGER = NULL,
  @idUser INTEGER = NULL,
  @orderBy VARCHAR(20) = 'DATE_DESC',
  @limitRecords INTEGER = 100
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {parameterRequired}
   */
  IF (@idAccount IS NULL)
  BEGIN
    ;THROW 51000, 'idAccountRequired', 1;
  END;

  /**
   * @validation Date range validation
   * @throw {invalidDateRange}
   */
  IF (@startDate IS NOT NULL AND @endDate IS NOT NULL AND @endDate < @startDate)
  BEGIN
    ;THROW 51000, 'endDateMustBeGreaterThanOrEqualToStartDate', 1;
  END;

  /**
   * @validation Movement type validation
   * @throw {invalidMovementType}
   */
  IF (@movementType IS NOT NULL AND @movementType NOT BETWEEN 0 AND 4)
  BEGIN
    ;THROW 51000, 'invalidMovementType', 1;
  END;

  /**
   * @validation Limit validation
   * @throw {invalidLimit}
   */
  IF (@limitRecords < 1 OR @limitRecords > 1000)
  BEGIN
    ;THROW 51000, 'limitMustBeBetween1And1000', 1;
  END;

  /**
   * @validation Product existence validation
   * @throw {productDoesntExist}
   */
  IF (@idProduct IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM [functional].[product] prd
    WHERE prd.[idProduct] = @idProduct
      AND prd.[idAccount] = @idAccount
  ))
  BEGIN
    ;THROW 51000, 'productDoesntExist', 1;
  END;

  /**
   * @rule {be-cte-pattern} CTE for movement data with running balance
   */
  WITH [MovementData] AS (
    SELECT
      stcMov.[idStockMovement],
      stcMov.[idProduct],
      prd.[name] AS [productName],
      stcMov.[idUser],
      stcMov.[movementType],
      stcMov.[quantity],
      stcMov.[unitCost],
      stcMov.[reason],
      stcMov.[referenceDocument],
      stcMov.[batchNumber],
      stcMov.[expirationDate],
      stcMov.[location],
      stcMov.[dateCreated],
      SUM(stcMov.[quantity]) OVER (
        PARTITION BY stcMov.[idProduct]
        ORDER BY stcMov.[dateCreated], stcMov.[idStockMovement]
        ROWS UNBOUNDED PRECEDING
      ) AS [runningBalance]
    FROM [functional].[stockMovement] stcMov
      JOIN [functional].[product] prd ON (prd.[idAccount] = stcMov.[idAccount] AND prd.[idProduct] = stcMov.[idProduct])
    WHERE stcMov.[idAccount] = @idAccount
      AND (@startDate IS NULL OR CAST(stcMov.[dateCreated] AS DATE) >= @startDate)
      AND (@endDate IS NULL OR CAST(stcMov.[dateCreated] AS DATE) <= @endDate)
      AND (@movementType IS NULL OR stcMov.[movementType] = @movementType)
      AND (@idProduct IS NULL OR stcMov.[idProduct] = @idProduct)
      AND (@idUser IS NULL OR stcMov.[idUser] = @idUser)
  )
  /**
   * @output {MovementList, n, n}
   * @column {INT} idStockMovement - Movement identifier
   * @column {INT} idProduct - Product identifier
   * @column {NVARCHAR} productName - Product name
   * @column {INT} idUser - User identifier
   * @column {INT} movementType - Movement type code
   * @column {NUMERIC} quantity - Movement quantity
   * @column {NUMERIC} unitCost - Unit cost
   * @column {NVARCHAR} reason - Movement reason
   * @column {VARCHAR} referenceDocument - Reference document
   * @column {VARCHAR} batchNumber - Batch number
   * @column {DATE} expirationDate - Expiration date
   * @column {NVARCHAR} location - Storage location
   * @column {DATETIME2} dateCreated - Movement date
   * @column {NUMERIC} runningBalance - Running balance after movement
   */
  SELECT TOP (@limitRecords)
    movDat.[idStockMovement],
    movDat.[idProduct],
    movDat.[productName],
    movDat.[idUser],
    movDat.[movementType],
    movDat.[quantity],
    movDat.[unitCost],
    movDat.[reason],
    movDat.[referenceDocument],
    movDat.[batchNumber],
    movDat.[expirationDate],
    movDat.[location],
    movDat.[dateCreated],
    movDat.[runningBalance]
  FROM [MovementData] movDat
  ORDER BY
    CASE WHEN @orderBy = 'DATE_DESC' THEN movDat.[dateCreated] END DESC,
    CASE WHEN @orderBy = 'DATE_ASC' THEN movDat.[dateCreated] END ASC,
    CASE WHEN @orderBy = 'PRODUCT' THEN movDat.[productName] END ASC,
    CASE WHEN @orderBy = 'TYPE' THEN movDat.[movementType] END ASC,
    CASE WHEN @orderBy = 'QUANTITY' THEN movDat.[quantity] END DESC,
    movDat.[idStockMovement] DESC;
END;
GO


-- ============================================
-- Migration completed successfully
-- ============================================

PRINT 'Migration completed successfully!';
GO
