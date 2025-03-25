// Convex doesn't export makeMigration in the current version

// Instead, we'll use a standard Convex function for migration
import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

// Migration function to add careerFields to existing options
export const migrateOptions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query("testQuestions").collect();
    
    for (const question of questions) {
      const updatedOptions = question.options.map(option => {
        // Extract career fields from option text if they're encoded as #FIELDS:field1,field2
        const careerFields = [];
        let text = option.text;
        
        const fieldMatch = text.match(/#FIELDS:(.*?)$/);
        if (fieldMatch) {
          careerFields.push(...fieldMatch[1].split(','));
          text = text.replace(/#FIELDS:.*?$/, '').trim();
        }
        
        return {
          ...option,
          text,
          careerFields: careerFields.length > 0 ? careerFields : undefined
        };
      });
      
      await ctx.db.patch(question._id, { options: updatedOptions });
    }
    
    return `Migrated ${questions.length} questions`;
  },
});

// Rollback function
export const rollbackOptionsMigration = internalMutation({
  args: {},
  handler: async (ctx) => {
    const questions = await ctx.db.query("testQuestions").collect();
    
    for (const question of questions) {
      const updatedOptions = question.options.map(option => {
        // Store career fields in the option text
        let text = option.text;
        if (option.careerFields && option.careerFields.length > 0) {
          text = `${text} #FIELDS:${option.careerFields.join(',')}`;
        }
        
        // Create a new option without careerFields
        const { careerFields, ...rest } = option;
        return {
          ...rest,
          text
        };
      });
      
      await ctx.db.patch(question._id, { options: updatedOptions });
    }
    
    return `Rolled back ${questions.length} questions`;
  },
});
