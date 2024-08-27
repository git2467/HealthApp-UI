class FoodNutrient {
  constructor(
    nutrientId,
    nutrientName,
    nutrientNumber,
    unitName,
    derivationCode,
    derivationDescription,
    derivationId,
    value,
    foodNutrientSourceId,
    foodNutrientSourceCode,
    foodNutrientSourceDescription,
    rank,
    indentLevel,
    foodNutrientId,
    dataPoints
  ) {
    this.nutrientId = nutrientId;
    this.nutrientName = nutrientName;
    this.nutrientNumber = nutrientNumber;
    this.unitName = unitName;
    this.derivationCode = derivationCode;
    this.derivationDescription = derivationDescription;
    this.derivationId = derivationId;
    this.value = value;
    this.foodNutrientSourceId = foodNutrientSourceId;
    this.foodNutrientSourceCode = foodNutrientSourceCode;
    this.foodNutrientSourceDescription = foodNutrientSourceDescription;
    this.rank = rank;
    this.indentLevel = indentLevel;
    this.foodNutrientId = foodNutrientId;
    this.dataPoints = dataPoints;
  }
}