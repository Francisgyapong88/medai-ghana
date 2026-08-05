import { PredictionFeatures } from "./featureExtraction.service";
import { RuleEngineService } from "./ruleEngine.service";
import { MLPredictionService } from "./mlPrediction.service";

export class AIService {

    /**
     * Determines which prediction engine to use.
     *
     * Rule Engine:
     *     Used while developing.
     *
     * ML Engine:
     *     Used after our trained model is deployed.
     */

    static async predict(features: PredictionFeatures) {

        const engine = process.env.AI_ENGINE || "rule";

        if (engine === "ml") {

            console.log("Using Machine Learning Prediction Engine...");

            return await MLPredictionService.predict(features);

        }

        console.log("Using Rule-Based Prediction Engine...");

        return await RuleEngineService.predict(features);

    }

}