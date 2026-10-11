
/*
============================================================
FUEL CALCULATIONS
============================================================
*/


// ============================================================
// FUEL PRICE
// ============================================================

export function calculateFuelPrice(totalPrice, liters) {
    if (liters <= 0) return 0;

    return totalPrice / liters;
}


// ============================================================
// DISTANCE
// ============================================================

export function calculateDistance(currentOdometer, previousOdometer) {
    return currentOdometer - previousOdometer;
}


// ============================================================
// FUEL EFFICIENCY
// ============================================================

export function calculateFuelEfficiency(distance, fuelLiters) {
    if (fuelLiters <= 0) return 0;

    return distance / fuelLiters;
}


// ============================================================
// EXPECTED DISTANCE
// ============================================================

export function calculateExpectedDistance(liters, rate = 18.30) {
    return liters * rate;
}


// ============================================================
// CASE 1: UNKNOWN LITERS
// รู้ยอดเงิน ราคา/ลิตร และ Odometer
// ============================================================

export function calculateFromPriceAndOdometer(
    totalPrice,
    pricePerLiter,
    currentOdometer,
    previousOdometer
) {
    if (totalPrice < 0 || pricePerLiter <= 0) {
        throw new Error("ยอดเงินหรือราคาน้ำมันไม่ถูกต้อง");
    }

    const liters = totalPrice / pricePerLiter;

    const distance = calculateDistance(
        currentOdometer,
        previousOdometer
    );

    const efficiency = calculateFuelEfficiency(
        distance,
        liters
    );

    return {
        liters,
        distance,
        efficiency
    };
}


// ============================================================
// CASE 2: UNKNOWN ODOMETER
// รู้ระยะทาง ยอดเงิน และราคา/ลิตร
// ============================================================

export function calculateFromDistanceAndPrice(
    distance,
    totalPrice,
    pricePerLiter
) {
    if (distance < 0 || totalPrice < 0 || pricePerLiter <= 0) {
        throw new Error("ข้อมูลระยะทางหรือราคาน้ำมันไม่ถูกต้อง");
    }

    const liters = totalPrice / pricePerLiter;

    const efficiency = calculateFuelEfficiency(
        distance,
        liters
    );

    return {
        liters,
        distance,
        efficiency
    };
}