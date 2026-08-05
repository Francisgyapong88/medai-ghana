export class ConfidenceCalculator {

    static calculate(probability: number): number {

        if (probability >= 0.95)
            return 99;

        if (probability >= 0.90)
            return 97;

        if (probability >= 0.85)
            return 95;

        if (probability >= 0.80)
            return 92;

        if (probability >= 0.70)
            return 88;

        if (probability >= 0.60)
            return 82;

        if (probability >= 0.50)
            return 75;

        if (probability >= 0.40)
            return 68;

        return 55;

    }

}