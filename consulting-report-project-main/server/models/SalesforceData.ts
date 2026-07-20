import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SalesforceDataAttributes {
  id: number;
  companyId: string;
  companyName: string;
  year: number;
  sales: number;
  profit: number;
}

interface SalesforceDataCreationAttributes extends Optional<SalesforceDataAttributes, 'id'> {}

export class SalesforceData extends Model<SalesforceDataAttributes, SalesforceDataCreationAttributes>
  implements SalesforceDataAttributes {
  public id!: number;
  public companyId!: string;
  public companyName!: string;
  public year!: number;
  public sales!: number;
  public profit!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SalesforceData.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'company_id',
    },
    companyName: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'company_name',
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sales: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    profit: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'salesforce_data',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        fields: ['company_id'],
      },
    ],
  }
);

export default SalesforceData;