// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import { AiAgentService } from './ai-agent.service';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class ContextLoaderService implements OnModuleInit {
//   private readonly logger = new Logger(ContextLoaderService.name);

//   constructor(private aiAgentService: AiAgentService) {}

//   async onModuleInit() {
//     // Auto-load context on startup
//     // await this.reloadKnowledgeBase();
//   }

//   async loadKnowledgeBase() {
//     try {
//       // Try multiple possible paths
//       const possiblePaths = [
//         path.join(process.cwd(), 'data', 'visa_data.json'),
//         path.join(process.cwd(), 'visa_data.json'),
//         path.join(__dirname, '..', '..', '..', '..', 'data', 'visa_data.json'),
//       ];

//       let filePath: string | null = null;

//       for (const p of possiblePaths) {
//         this.logger.log(`🔍 Checking: ${p}`);
//         if (fs.existsSync(p)) {
//           filePath = p;
//           this.logger.log(`✅ Found file at: ${p}`);
//           break;
//         }
//       }

//       if (!filePath) {
//         this.logger.error('❌ Visa data file not found');
//         return;
//       }

//       // Read and clean file
//       let rawData = fs.readFileSync(filePath, 'utf-8');

//       // Clean invalid JSON values
//       this.logger.log('🧹 Cleaning JSON data...');
//       rawData = rawData
//         .replace(/:\s*NaN/g, ': null')
//         .replace(/:\s*Infinity/g, ': null')
//         .replace(/:\s*-Infinity/g, ': null')
//         .replace(/:\s*undefined/g, ': null');

//       // Parse JSON
//       const visaData = JSON.parse(rawData);

//       this.logger.log(`📊 JSON parsed successfully`);
//       this.logger.log(`📊 Found ${visaData.length} visa records`);

//       const contexts = [];

//       // Process each visa record
//       for (const record of visaData) {
//         const country = record['Country Name'];
//         const category = record['Categories'];

//         if (!country) continue;

//         // ========== COUNTRY OVERVIEW ==========
//         const countryOverview = [
//           `Country: ${country}`,
//           `Capital: ${record['Capital']}`,
//           `Category: ${category}`,
//           `Embassy in Bangladesh: ${record['Embassy in Bangladesh']}`,
//           `VFS in Bangladesh: ${record['VFS in Bangladesh']}`,
//         ]
//           .filter((item) => !item.includes('null') && !item.includes('undefined'))
//           .join('. ');

//         contexts.push({
//           content: countryOverview,
//           category: 'country_overview',
//           metadata: {
//             country,
//             category,
//             capital: record['Capital'],
//           },
//         });

//         // ========== VISA PROCESSING INFO ==========
//         const processingInfo = [
//           `Visa processing for ${country}`,
//           `Smooth Process: ${record['Smooth Process']}`,
//           record['Difficulty Reason'] ? `Difficulty: ${record['Difficulty Reason']}` : null,
//           record['Embassy Processing Time']
//             ? `Processing Time: ${record['Embassy Processing Time']}`
//             : null,
//           record['Actual Processing Time Based On Our Oberservation']
//             ? `Actual Processing Time: ${record['Actual Processing Time Based On Our Oberservation']}`
//             : null,
//           `Appointment: ${record['Appointment']}`,
//           `Application Process: ${record['Application Process']}`,
//           `Submission Method: ${record['Submission Method']}`,
//           `Collection Method: ${record['Collection Method']}`,
//         ]
//           .filter(Boolean)
//           .join('. ');

//         contexts.push({
//           content: processingInfo,
//           category: 'visa_processing',
//           metadata: {
//             country,
//             smoothProcess: record['Smooth Process'],
//             appointment: record['Appointment'],
//           },
//         });

//         // ========== VISA TYPES & FACILITIES ==========
//         const visaTypes = [
//           `Visa facilities for ${country}`,
//           record['Visa Free'] === 'Yes' ? 'Visa Free entry available' : null,
//           record['On Arrival'] === 'Yes' ? 'Visa on Arrival available' : null,
//           record['E Visa'] === 'Yes' ? 'E-Visa available' : null,
//           record['Transit Visa Facilities']
//             ? `Transit: ${record['Transit Visa Facilities']}`
//             : null,
//           record['Transit Facilties Without Visa']
//             ? `Transit without visa: ${record['Transit Facilties Without Visa']}`
//             : null,
//           record['Maximum Stay Permission']
//             ? `Maximum stay: ${record['Maximum Stay Permission']}`
//             : null,
//           record['Official Passport Holder']
//             ? `Official passport: ${record['Official Passport Holder']}`
//             : null,
//           record['Diplomatioc Passport Holder']
//             ? `Diplomatic passport: ${record['Diplomatioc Passport Holder']}`
//             : null,
//         ]
//           .filter(Boolean)
//           .join('. ');

//         contexts.push({
//           content: visaTypes,
//           category: 'visa_types',
//           metadata: {
//             country,
//             visaFree: record['Visa Free'],
//             onArrival: record['On Arrival'],
//             eVisa: record['E Visa'],
//           },
//         });

//         // ========== VISA FEES ==========
//         const visaFees = [
//           `Visa fees for ${country}`,
//           record['Visa Fees Short Term-Single Entry (BDT)']
//             ? `Short term single entry: ${record['Visa Fees Short Term-Single Entry (BDT)']} BDT`
//             : null,
//           record['Visa Fees Short Term-Multiple Entry (BDT)']
//             ? `Short term multiple entry: ${record['Visa Fees Short Term-Multiple Entry (BDT)']} BDT`
//             : null,
//           record['Visa Fees Long Term-Single Entry (BDT)']
//             ? `Long term single entry: ${record['Visa Fees Long Term-Single Entry (BDT)']} BDT`
//             : null,
//           record['Visa Fees Long Term-Multiple Entry (BDT)']
//             ? `Long term multiple entry: ${record['Visa Fees Long Term-Multiple Entry (BDT)']} BDT`
//             : null,
//           record['VFS Fees'] ? `VFS Fees: ${record['VFS Fees']}` : null,
//           record['Minor Citizen Fees (6-12 Years)']
//             ? `Minor fees: ${record['Minor Citizen Fees (6-12 Years)']}`
//             : null,
//           record['Visa Fee Payment Method']
//             ? `Payment method: ${record['Visa Fee Payment Method']}`
//             : null,
//         ]
//           .filter(Boolean)
//           .join('. ');

//         if (visaFees.split('.').length > 2) {
//           contexts.push({
//             content: visaFees,
//             category: 'visa_fees',
//             metadata: {
//               country,
//               paymentMethod: record['Visa Fee Payment Method'],
//             },
//           });
//         }

//         // ========== SERVICES AVAILABLE ==========
//         const services = [];
//         const serviceFields = [
//           { key: 'Consultancy', name: 'Consultancy', fees: record['Consultancy Fees'] },
//           { key: 'Offshore', name: 'Offshore services', fees: record['Offshore Fees'] },
//           { key: 'E Visa', name: 'E-Visa', fees: record['E-Visa Fees'] },
//           { key: 'Onshore', name: 'Onshore services', fees: record['Onshore Fees'] },
//           { key: 'Legalization', name: 'Legalization', fees: record['Legalization Fees'] },
//           {
//             key: 'Admission Assistance',
//             name: 'Admission assistance',
//             fees: record['Admission Assistance Fees'],
//           },
//           {
//             key: 'Visa Consultancy (Study Visa)',
//             name: 'Study visa consultancy',
//             fees: record['Visa Consultancy (Study Visa)- Fees'],
//           },
//         ];

//         for (const service of serviceFields) {
//           if (record[service.key] === 'Yes') {
//             services.push(`${service.name}: Available (${service.fees})`);
//           }
//         }

//         if (services.length > 0) {
//           contexts.push({
//             content: `Services available for ${country}: ${services.join(', ')}`,
//             category: 'services',
//             metadata: { country },
//           });
//         }

//         // ========== REQUIREMENTS ==========
//         const requirements = [
//           `Requirements for ${country}`,
//           record['English Proficiency']
//             ? `English proficiency: ${record['English Proficiency']}`
//             : null,
//           record['Educational Qualification']
//             ? `Education: ${record['Educational Qualification']}`
//             : null,
//           record['PCC Required'] ? `PCC: ${record['PCC Required']}` : null,
//           record['Health Insurance Required']
//             ? `Health insurance: ${record['Health Insurance Required']}`
//             : null,
//           record['Juridiction Short Term']
//             ? `Short term jurisdiction: ${record['Juridiction Short Term']}`
//             : null,
//           record['Juridiction Long Term']
//             ? `Long term jurisdiction: ${record['Juridiction Long Term']}`
//             : null,
//         ]
//           .filter(Boolean)
//           .join('. ');

//         if (requirements.split('.').length > 2) {
//           contexts.push({
//             content: requirements,
//             category: 'requirements',
//             metadata: {
//               country,
//               pccRequired: record['PCC Required'],
//               healthInsurance: record['Health Insurance Required'],
//             },
//           });
//         }

//         // ========== EMBASSY & VFS INFO ==========
//         const contactInfo = [
//           `Contact information for ${country} visa`,
//           record['Embassy in Bangladesh'] === 'Yes' ? 'Embassy in Bangladesh available' : null,
//           record['VFS in Bangladesh'] === 'Yes' ? 'VFS in Bangladesh available' : null,
//           record['Embassy in India'] === 'Yes' ? 'Embassy in India available' : null,
//           record['VFS in India'] === 'Yes' ? 'VFS in India available' : null,
//           record['Embassy/High Commission in Bangladesh Website']
//             ? `Website: ${record['Embassy/High Commission in Bangladesh Website']}`
//             : null,
//           record['E Visa Website'] ? `E-Visa website: ${record['E Visa Website']}` : null,
//           record['Immigration Website']
//             ? `Immigration website: ${record['Immigration Website']}`
//             : null,
//         ]
//           .filter(Boolean)
//           .join('. ');

//         contexts.push({
//           content: contactInfo,
//           category: 'embassy_info',
//           metadata: {
//             country,
//             embassyInBD: record['Embassy in Bangladesh'],
//             vfsInBD: record['VFS in Bangladesh'],
//           },
//         });

//         // ========== ADDITIONAL INFO ==========
//         if (record['Exceptional Visa Rules']) {
//           contexts.push({
//             content: `Exceptional visa rules for ${country}: ${record['Exceptional Visa Rules']}`,
//             category: 'exceptional_rules',
//             metadata: { country },
//           });
//         }

//         if (record['Visa Extension'] === 'Yes') {
//           contexts.push({
//             content: `Visa extension available for ${country}`,
//             category: 'visa_extension',
//             metadata: { country },
//           });
//         }

//         if (record['Appeal Procedure']) {
//           contexts.push({
//             content: `Appeal procedure for ${country}: ${record['Appeal Procedure']}`,
//             category: 'appeal_procedure',
//             metadata: { country },
//           });
//         }
//       }

//       if (contexts.length === 0) {
//         this.logger.warn('⚠️ No contexts created from JSON file');
//         return;
//       }

//       // Bulk add all contexts
//       this.logger.log(`📥 Adding ${contexts.length} contexts to knowledge base...`);
//       const result = await this.aiAgentService.addKnowledgeContexts(contexts);

//       this.logger.log(`✅ Successfully loaded ${contexts.length} contexts!`);
//       return result;
//     } catch (error) {
//       this.logger.error('❌ Failed to load knowledge base');
//       this.logger.error(`Error: ${error.message}`);
//     }
//   }

//   async loadKnowledgeBaseForVTS() {
//     try {
//       // Try multiple possible paths
//       const possiblePaths = [
//         path.join(process.cwd(), 'data', 'final_kb_updated_with_latest_courses.json'),
//         path.join(process.cwd(), 'final_kb_updated_with_latest_courses.json'),
//         path.join(
//           __dirname,
//           '..',
//           '..',
//           '..',
//           '..',
//           'data',
//           'final_kb_updated_with_latest_courses.json',
//         ),
//       ];

//       let filePath: string | null = null;

//       for (const p of possiblePaths) {
//         this.logger.log(`🔍 Checking: ${p}`);
//         if (fs.existsSync(p)) {
//           filePath = p;
//           this.logger.log(`✅ Found file at: ${p}`);
//           break;
//         }
//       }

//       if (!filePath) {
//         this.logger.error('❌ Knowledge base file not found');
//         return;
//       }

//       // Read and clean file
//       let rawData = fs.readFileSync(filePath, 'utf-8');

//       // Clean invalid JSON values
//       this.logger.log('🧹 Cleaning JSON data...');
//       rawData = rawData
//         .replace(/:\s*NaN/g, ': null')
//         .replace(/:\s*Infinity/g, ': null')
//         .replace(/:\s*-Infinity/g, ': null')
//         .replace(/:\s*undefined/g, ': null');

//       // Parse JSON
//       const knowledgeBase = JSON.parse(rawData);

//       this.logger.log(`📊 JSON parsed successfully`);
//       this.logger.log(`📊 Structure: ${JSON.stringify(Object.keys(knowledgeBase))}`);

//       const contexts = [];

//       // Process COUNTRIES
//       if (knowledgeBase.countries && Array.isArray(knowledgeBase.countries)) {
//         this.logger.log(`🌍 Found ${knowledgeBase.countries.length} countries`);

//         for (const country of knowledgeBase.countries) {
//           const countryName = country.country;

//           // Add country overview
//           contexts.push({
//             content: `Country: ${countryName}. Study abroad destination with universities, courses, and visa information.`,
//             category: 'countries',
//             metadata: { country: countryName },
//           });

//           // ========== UNIVERSITIES ==========
//           if (country.universities && Array.isArray(country.universities)) {
//             this.logger.log(
//               `🎓 Found ${country.universities.length} universities in ${countryName}`,
//             );

//             for (const university of country.universities) {
//               const uniName = university.university_name;
//               const details = university.details || '';
//               const costOfLiving = university.cost_of_living
//                 ? `Cost of living: $${university.cost_of_living}`
//                 : '';
//               const rank = university.rank ? `World rank: ${university.rank}` : '';
//               const language = university.language ? `Language: ${university.language}` : '';
//               const type = university.type ? `Type: ${university.type}` : '';
//               const address = university.address ? `Address: ${university.address}` : '';

//               contexts.push({
//                 content:
//                   `University: ${uniName} in ${countryName}. ${details} ${rank}. ${language}. ${type}. ${costOfLiving}. ${address}`.trim(),
//                 category: 'universities',
//                 metadata: {
//                   universityId: university.id,
//                   universityName: uniName,
//                   country: countryName,
//                   rank: university.rank,
//                   language: university.language,
//                 },
//               });

//               // Requirements
//               if (university.Educational_Qualification) {
//                 contexts.push({
//                   content: `Educational qualification for ${uniName}: ${university.Educational_Qualification}`,
//                   category: 'qualifications',
//                   metadata: { universityId: university.id, universityName: uniName },
//                 });
//               }

//               if (university.PCC_Required) {
//                 contexts.push({
//                   content: `PCC requirement for ${uniName}: ${university.PCC_Required}`,
//                   category: 'requirements',
//                   metadata: { universityId: university.id, universityName: uniName },
//                 });
//               }

//               if (university.Health_Insurance_Required) {
//                 contexts.push({
//                   content: `Health insurance for ${uniName}: ${university.Health_Insurance_Required}`,
//                   category: 'requirements',
//                   metadata: { universityId: university.id, universityName: uniName },
//                 });
//               }
//             }
//           }

//           // ========== COURSES (inside country) ==========
//           if (country.courses && Array.isArray(country.courses)) {
//             this.logger.log(`📚 Found ${country.courses.length} courses in ${countryName}`);

//             for (const course of country.courses) {
//               // Main course info
//               const courseContent = [
//                 `Course: ${course.title || course.name}`,
//                 course.description ? `Description: ${course.description}` : '',
//                 course.duration ? `Duration: ${course.duration}` : '',
//                 course.level ? `Level: ${course.level}` : '',
//                 course.price ? `Price: ${course.price}` : '',
//                 course.tuition_fee ? `Tuition: ${course.tuition_fee}` : '',
//                 course.instructor ? `Instructor: ${course.instructor}` : '',
//                 `Available in ${countryName}`,
//               ]
//                 .filter(Boolean)
//                 .join('. ');

//               contexts.push({
//                 content: courseContent,
//                 category: 'courses',
//                 metadata: {
//                   courseId: course.id,
//                   courseName: course.title || course.name,
//                   country: countryName,
//                   category: course.category,
//                 },
//               });

//               // Course modules
//               if (course.modules && Array.isArray(course.modules)) {
//                 for (const module of course.modules) {
//                   contexts.push({
//                     content: `Module in ${course.title}: ${module.title}. Topics: ${module.topics?.join(', ') || 'Various topics'}`,
//                     category: 'modules',
//                     metadata: {
//                       courseId: course.id,
//                       courseName: course.title,
//                       moduleName: module.title,
//                     },
//                   });
//                 }
//               }

//               // Course reviews
//               if (course.reviews && Array.isArray(course.reviews)) {
//                 for (const review of course.reviews) {
//                   contexts.push({
//                     content: `Review for ${course.title} by ${review.user}: ${review.comment}. Rating: ${review.rating}/5`,
//                     category: 'reviews',
//                     metadata: {
//                       courseId: course.id,
//                       courseName: course.title,
//                       rating: review.rating,
//                     },
//                   });
//                 }
//               }
//             }
//           }

//           // ========== ASSESSMENTS ==========
//           if (country.assessments && Array.isArray(country.assessments)) {
//             this.logger.log(`📝 Found ${country.assessments.length} assessments in ${countryName}`);

//             for (const assessment of country.assessments) {
//               const assessmentContent = [
//                 `Assessment: ${assessment.name || assessment.title}`,
//                 assessment.description ? assessment.description : '',
//                 assessment.type ? `Type: ${assessment.type}` : '',
//                 `Available in ${countryName}`,
//               ]
//                 .filter(Boolean)
//                 .join('. ');

//               contexts.push({
//                 content: assessmentContent,
//                 category: 'assessments',
//                 metadata: {
//                   assessmentId: assessment.id,
//                   assessmentName: assessment.name || assessment.title,
//                   country: countryName,
//                 },
//               });
//             }
//           }

//           // ========== VISA INFO ==========
//           if (country.visa_info && Array.isArray(country.visa_info)) {
//             this.logger.log(
//               `🛂 Found ${country.visa_info.length} visa info items in ${countryName}`,
//             );

//             for (const visa of country.visa_info) {
//               const visaContent = [
//                 `Visa information for ${countryName}`,
//                 visa.type ? `Visa type: ${visa.type}` : '',
//                 visa.requirements ? `Requirements: ${visa.requirements}` : '',
//                 visa.processing_time ? `Processing time: ${visa.processing_time}` : '',
//                 visa.fee ? `Fee: ${visa.fee}` : '',
//                 visa.description ? visa.description : '',
//               ]
//                 .filter(Boolean)
//                 .join('. ');

//               contexts.push({
//                 content: visaContent,
//                 category: 'visa_info',
//                 metadata: {
//                   visaId: visa.id,
//                   country: countryName,
//                   visaType: visa.type,
//                 },
//               });
//             }
//           }
//         }
//       }

//       // ========== TOP-LEVEL FAQS (if any) ==========
//       if (knowledgeBase.faqs && Array.isArray(knowledgeBase.faqs)) {
//         this.logger.log(`❓ Found ${knowledgeBase.faqs.length} FAQs`);
//         for (const faq of knowledgeBase.faqs) {
//           contexts.push({
//             content: `Q: ${faq.question}\nA: ${faq.answer}`,
//             category: 'faqs',
//             metadata: { question: faq.question },
//           });
//         }
//       }

//       // ========== TOP-LEVEL POLICIES (if any) ==========
//       if (knowledgeBase.policies) {
//         this.logger.log(`📋 Found policies`);
//         for (const [key, value] of Object.entries(knowledgeBase.policies)) {
//           contexts.push({
//             content: `${key}: ${value}`,
//             category: 'policies',
//             metadata: { policyType: key },
//           });
//         }
//       }

//       if (contexts.length === 0) {
//         this.logger.warn('⚠️ No contexts created from JSON file');
//         return;
//       }

//       // Bulk add all contexts
//       this.logger.log(`📥 Adding ${contexts.length} contexts to knowledge base...`);
//       const result = await this.aiAgentService.addKnowledgeContexts(contexts);

//       this.logger.log(`✅ Successfully loaded ${contexts.length} contexts!`);
//       return result;
//     } catch (error) {
//       this.logger.error('❌ Failed to load knowledge base');
//       this.logger.error(`Error: ${error.message}`);
//     }
//   }

//   async reloadKnowledgeBase() {
//     this.logger.log('🔄 Reloading knowledge base...');
//     await this.aiAgentService.clearAllContexts();
//     await this.loadKnowledgeBase();
//   }
// }
