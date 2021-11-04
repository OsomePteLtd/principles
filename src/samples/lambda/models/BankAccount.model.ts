import moment from 'moment';
import { Association, BelongsToGetAssociationMixin, DataTypes, Model, Optional } from 'sequelize';

import { sequelize } from '../lib/sequelize';
import { Company } from './Company.model';
import { Contact } from './Contact.model';

interface BankAccountAttributes {
  id: number;
  name: string;
  bankAccountNumber: string | null;
  bankAccountMask: string | null;
  bankContactId: number | null;
  companyId: number;
  currencyCode: string;
  openDate: string | null;
  closeDate: string | null;
}

type BankAccountAttributesNullable =
  | 'bankAccountNumber'
  | 'bankAccountMask'
  | 'openDate'
  | 'closeDate';

export type BankAccountAttributesNew = Optional<
  Pick<
    BankAccountAttributes,
    | 'name'
    | 'bankAccountNumber'
    | 'bankAccountMask'
    | 'currencyCode'
    | 'openDate'
    | 'closeDate'
    | 'companyId'
    | 'bankContactId'
  >,
  BankAccountAttributesNullable
>;

export class BankAccount extends Model<BankAccountAttributes, BankAccountAttributesNew> {
  static company: Association<BankAccount, Company>;
  static bankContact: Association<BankAccount, Contact>;

  static associate() {
    this.company = this.belongsTo(Company);
    this.bankContact = this.belongsTo(Contact, {
      as: 'bankContact',
      foreignKey: 'bankContactId',
    });
  }

  // instance

  readonly id!: number;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;
  readonly deletedAt!: Date | null;

  name!: string;
  bankAccountNumber!: string | null;
  bankAccountMask!: string | null;
  currencyCode!: string;

  openDate!: string | null;
  closeDate!: string | null;

  companyId!: number;
  company?: Company;
  getCompany!: BelongsToGetAssociationMixin<Company>;

  bankContactId!: number;
  bankContact?: Contact;
  getBankContact!: BelongsToGetAssociationMixin<Contact>;
}

BankAccount.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bankAccountNumber: {
      type: DataTypes.STRING,
    },
    bankAccountMask: {
      type: DataTypes.STRING,
    },
    bankContactId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currencyCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    openDate: {
      type: DataTypes.DATEONLY,
      validate: {
        isDate: { msg: 'must be date', args: true },
      },
    },
    closeDate: {
      type: DataTypes.DATEONLY,
      validate: {
        isDate: { msg: 'must be date', args: true },
      },
    },
  },
  {
    sequelize,
    validate: {
      closeDateAfterOpen(this: BankAccount) {
        if (!moment(this.openDate).isValid() || !moment(this.closeDate).isValid()) {
          return;
        }
        if (!moment(this.openDate).isSameOrBefore(this.closeDate)) {
          throw new Error('close date should be later than open date');
        }
      },
    },
    tableName: 'bankAccounts',
    name: { singular: 'bankAccount', plural: 'bankAccounts' },
    paranoid: true,
  },
);
