import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export const DECISION_GRAPH_CONTENT_TYPE = 'application/vnd.gorules.decision';
const id = z.string().default(crypto.randomUUID || uuidv4());


const nodeCommon = z.object({
  id,
  name: z.string(),
  position: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 0 }),
});

export const inputNodeSchema = z
  .object({
    type: z.literal('inputNode'),
  })
  .merge(nodeCommon);

export const outputNodeSchema = z
  .object({
    type: z.literal('outputNode'),
  })
  .merge(nodeCommon);

export const decisionTableSchema = z
  .object({
    type: z.literal('decisionTableNode'),
    content: z.object({
      hitPolicy: z.enum(['first', 'collect']).default('first'),
      rules: z.array(z.record(z.string(), z.string())).default([]),
      inputs: z.array(
        z.object({
          id,
          name: z.string().nullish(),
          field: z.string().nullish(),
          defaultValue: z.string().nullish(),
        }),
      ),
      outputs: z.array(
        z.object({
          id,
          name: z.string(),
          field: z.string(),
          defaultValue: z.string().nullish(),
        }),
      ),
      passThrough: z.boolean().nullish().default(false),
      inputField: z
        .string()
        .nullish()
        .default(null)
        .transform((val) => (val && val.trim().length > 0 ? val : null)),
      outputPath: z
        .string()
        .nullish()
        .default(null)
        .transform((val) => (val && val.trim().length > 0 ? val : null)),
      executionMode: z.enum(['single', 'loop']).nullish().default('single'),
    }),
  })
  .merge(nodeCommon);

export const functionNodeSchema = z
  .object({
    type: z.literal('functionNode'),
    content: z
      .string()
      .or(
        z.object({
          source: z.string().default(''),
        }),
      )
      .nullish(),
  })
  .merge(nodeCommon);

export const expressionNodeSchema = z
  .object({
    type: z.literal('expressionNode'),
    content: z.object({
      expressions: z.array(
        z.object({
          id,
          key: z.string().default(''),
          value: z.string().default(''),
        }),
      ),
      passThrough: z.boolean().nullish().default(false),
      inputField: z
        .string()
        .nullish()
        .default(null)
        .transform((val) => (val && val.trim().length > 0 ? val : null)),
      outputPath: z
        .string()
        .nullish()
        .default(null)
        .transform((val) => (val && val.trim().length > 0 ? val : null)),
      executionMode: z.enum(['single', 'loop']).nullish().default('single'),
    }),
  })
  .merge(nodeCommon);

export const decisionNodeSchema = z
  .object({
    type: z.literal('decisionNode'),
    content: z.object({
      key: z.string(),
      passThrough: z.boolean().nullish().default(false),
      inputField: z
        .string()
        .nullish()
        .default(null)
        .transform((val) => (val && val.trim().length > 0 ? val : null)),
      outputPath: z
        .string()
        .nullish()
        .default(null)
        .transform((val) => (val && val.trim().length > 0 ? val : null)),
      executionMode: z.enum(['single', 'loop']).nullish().default('single'),
    }),
  })
  .merge(nodeCommon);

export const switchNodeSchema = z
  .object({
    type: z.literal('switchNode'),
    content: z.object({
      hitPolicy: z.enum(['first', 'collect']).default('first'),
      statements: z.array(
        z.object({
          id,
          condition: z.string().nullish().default(''),
          isDefault: z.boolean().nullish().default(false),
        }),
      ),
    }),
  })
  .merge(nodeCommon);

export const customNodeSchema = z
  .object({
    type: z.literal('customNode'),
    content: z.object({
      kind: z.string(),
      config: z.any(),
    }),
  })
  .merge(nodeCommon);

export const anyNodeSchema = z
  .object({
    type: z.string(),
    content: z.any().nullish(),
  })
  .merge(nodeCommon);

export const nodeSchema = z
  .discriminatedUnion('type', [
    decisionNodeSchema,
    expressionNodeSchema,
    functionNodeSchema,
    decisionTableSchema,
    switchNodeSchema,
    customNodeSchema,
    inputNodeSchema,
    outputNodeSchema,
  ])
  .or(anyNodeSchema);

export const edgeSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  sourceHandle: z.string().nullish(),
  type: z.enum(['edge']),
});

export const validationSchema = z.object({
  inputSchema: z.any().nullish().default(null),
  outputSchema: z.any().nullish().default(null),
});

export const settingsSchema = z
  .object({
    validation: validationSchema,
  })
  .default({
    validation: {
      inputSchema: null,
      outputSchema: null,
    },
  });

export const decisionModelSchema = z.object({
  nodes: z.array(nodeSchema).default([]),
  edges: z.array(edgeSchema).default([]),
  settings: settingsSchema,
});
