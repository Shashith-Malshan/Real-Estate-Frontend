/**
 * Property and Listing Models
 */

export enum PropertyCategory {
  RESIDENTIAL = 1,
  COMMERCIAL = 2,
  LAND = 3
}

export const CategoryNames: Record<number, string> = {
  1: 'Residential',
  2: 'Commercial',
  3: 'Land'
};

export interface PropertyDTO {
  propertyId: number;
  title: string;
  description: string;
  location: string;
  district: string;
  propertyCategoryId: number;
  categoryName: string;
  visitCount: number;
  inquiryCount: number;
  price?: number;
  type?: string;
  status?: string;
  bedroomCount?: number;
  bathroomCount?: number;
  floorSize?: number;
  plotCount?: number;
  unitPrice?: number;
}

export interface PropertyCreateDTO {
  title: string;
  description: string;
  location: string;
  district: string;
  propertyCategoryId: number;
  price?: number;
  bedroomCount?: number;
  bathroomCount?: number;
  residentialType?: string;
  residentialStatus?: string;
  floorSize?: number;
  commercialType?: string;
  commercialStatus?: string;
  plotCount?: number;
  unitPrice?: number;
  imagePaths?: string[];
}

export interface PropertyUpdateDTO extends Partial<PropertyCreateDTO> {
  propertyId: number;
}

export enum ResidentialType {
  HOUSE = 'house',
  APARTMENT = 'apartment'
}

export enum ResidentialStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed'
}

export enum CommercialType {
  OFFICE = 'office',
  SHOPPING_CENTER = 'shopping center',
  RESTAURANT = 'restaurant',
  HOTEL = 'hotel'
}

export enum CommercialStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed'
}
