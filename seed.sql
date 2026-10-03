-- Seed vehicles
INSERT INTO vehicles (name, class) VALUES ('Mercedes S-Class or similar', 'Luxury Sedan') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('BMW 7-Series or similar', 'Luxury Sedan') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Audi A8', 'Luxury Sedan') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Mercedes E-Class / Audi A6 or similar', 'Executive Sedan') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('BMW 5-Series or similar', 'Executive Sedan') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Mercedes C-Class or similar', 'Executive Sedan') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Business Class Sedan – Lexus ES350/250 or similar', 'Executive Sedan') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Genesis G80/G90', 'Executive Sedan') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Toyota Camry / Mazda 6 (Mid-size Sedan)', 'Sedan') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Hyundai Elantra or similar (Economy Sedan)', 'Economy Sedan') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Hyundai Accent / Compact Economy Sedan', 'Economy Sedan') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Sedan – Ford Taurus or similar', 'Sedan') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Mercedes G-Class', 'Luxury SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Range Rover (Full-size)', 'Luxury SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Cadillac Escalade', 'Luxury SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Lexus 570 / LX-Series (Luxury SUV)', 'Luxury SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Audi Q8', 'Luxury SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Lincoln Navigator', 'Luxury SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Compact Luxury SUV – Range Rover Evoque / Mercedes GLC / BMW X4 / Audi Q5 or similar', 'SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Chevrolet Suburban', 'SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('GMC Yukon / Chevrolet Tahoe or similar', 'SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Toyota Land Cruiser or similar', 'SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Nissan Patrol or similar', 'SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Toyota Prado or similar', 'SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Toyota Fortuner or similar', 'SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Hyundai Tucson or similar (Compact SUV)', 'SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Nissan X-Trail / Geely Tugella (Compact SUV)', 'SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Ford Bronco', 'SUV') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Mercedes Sprinter (Luxury Van)', 'Van') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Mercedes V-Class', 'Van') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Mercedes Vito / Viano (Van) or similar', 'Van') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Kia Carnival (Van)', 'Van') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Accessible (PWD) Van', 'Van') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Hyundai Staria (Passenger Van)', 'Van') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Toyota Hiace (13-Seater Passenger Van)', 'Van') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Urbania (16-Seater Van)', 'Van') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('JAC Sunray (15-Seater Van)', 'Van') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Luggage Van', 'Utility') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Coaster Bus (23-Seater)', 'Minibus') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Mini Bus (30–35 Seater)', 'Minibus') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Bus (49-Seater)', 'Coach') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Golf Cart', 'Utility') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Box Truck', 'Utility') ON CONFLICT (name) DO NOTHING;
INSERT INTO vehicles (name, class) VALUES ('Pickup Double Cab – Isuzu D-Max / Toyota Hilux or similar', 'Utility') ON CONFLICT (name) DO NOTHING;

-- Seed KSA cities
INSERT INTO cities (country, city, currency) VALUES ('KSA', 'Riyadh', 'SAR') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('KSA', 'Jeddah', 'SAR') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('KSA', 'Dammam & Al Khobar', 'SAR') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('KSA', 'AlUla', 'SAR') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('KSA', 'Other KSA', 'SAR') ON CONFLICT (country, city) DO NOTHING;

-- Seed UAE cities
INSERT INTO cities (country, city, currency) VALUES ('UAE', 'Dubai', 'AED') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('UAE', 'Abu Dhabi', 'AED') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('UAE', 'Other UAE', 'AED') ON CONFLICT (country, city) DO NOTHING;

-- Seed International cities
INSERT INTO cities (country, city, currency) VALUES ('International', 'Atlanta', 'USD') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Bahrain', 'BHD') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Berlin', 'EUR') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Brussels', 'EUR') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Delhi', 'INR') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Doha', 'QAR') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Houston', 'USD') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Indianapolis', 'USD') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Kigali', 'USD') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Las Vegas', 'USD') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'London', 'GBP') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Los Angeles', 'USD') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Manchester', 'GBP') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Mexico City', 'USD') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Miami', 'USD') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Mumbai', 'INR') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Nairobi', 'USD') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'New York', 'USD') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Ontario', 'CAD') ON CONFLICT (country, city) DO NOTHING;
INSERT INTO cities (country, city, currency) VALUES ('International', 'Paris', 'EUR') ON CONFLICT (country, city) DO NOTHING;