import { mongoose } from 'connections';

const IndexSchema = new mongoose.Schema(
        {
            modelName: { type: String, required: true },
            fields: [
                {
                    fieldName: { type: String, required: true },
                    indexed: { type: Boolean, required: true, default: false },
                    type: { type: String, required: true },
                }
            ]
        },
        { timestamps: true, strict: false },
);

const indexModel = mongoose.model('Index', IndexSchema);

export default indexModel;
