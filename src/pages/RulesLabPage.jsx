import { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ruleApi } from '../api/client.js';

const OPERATORS = [
  { value: '>', label: 'Greater than (>)' },
  { value: '>=', label: 'Greater than or equal (>=)' },
  { value: '=', label: 'Equals (=)' },
  { value: '<=', label: 'Less than or equal (<=)' },
  { value: '<', label: 'Less than (<)' },
  { value: '!=', label: 'Not equal (!=)' },
];

const ACTIONS = [
  { value: 'flag', label: 'Flag transaction' },
  { value: 'review', label: 'Send for review' },
  { value: 'alert', label: 'Create alert' },
];

export default function RulesLabPage() {
  const [rules, setRules] = useState([]);

  const [name, setName] = useState('High value transaction');
  const [description, setDescription] = useState(
    'Flag transactions above the configured amount.'
  );
  const [field, setField] = useState('amount');
  const [operator, setOperator] = useState('>');
  const [value, setValue] = useState('10000');
  const [action, setAction] = useState('flag');
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadRules = async () => {
    try {
      const result = await ruleApi.list();
      setRules(result.rules || []);
    } catch (error) {
      toast.error(error.message || 'Unable to load rules.');
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const conditionPreview = useMemo(() => {
    const cleanField = field.trim() || 'field';
    const cleanValue = value.trim() || 'value';

    return `${cleanField} ${operator} ${cleanValue}`;
  }, [field, operator, value]);

  const selectedOperator = OPERATORS.find(
    (item) => item.value === operator
  );

  const selectedAction = ACTIONS.find(
    (item) => item.value === action
  );

  const createRule = async () => {
    if (!name.trim()) {
      toast.error('Enter a rule name.');
      return;
    }

    if (!field.trim()) {
      toast.error('Enter a field name.');
      return;
    }

    if (!value.trim()) {
      toast.error('Enter a value.');
      return;
    }

    setSaving(true);

    try {
      await ruleApi.create({
        name: name.trim(),
        description: description.trim(),
        conditions: [conditionPreview],
        action,
        enabled,
      });

      await loadRules();

      toast.success('Rule created.');

      setName('');
      setDescription('');
      setField('amount');
      setOperator('>');
      setValue('');
      setAction('flag');
      setEnabled(false);
    } catch (error) {
      toast.error(error.message || 'Unable to create rule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rules-lab-page">

      {/* PAGE HEADER */}
      <header className="rules-page-header">
        <div>
          <div className="rules-kicker">
            CONTROL LOGIC
          </div>

          <h1>
            Rules Lab
          </h1>

          <p>
            Create reusable transaction conditions for automated
            review and investigation workflows.
          </p>
        </div>
      </header>


      {/* WORKSPACE */}
      <div className="rules-workspace">

        {/* =====================================================
            NEW RULE
            ===================================================== */}
        <article className="rules-builder">

          <div className="rules-builder-header">
            <div>
              <h2>New rule</h2>
              <p>
                Define a field, comparison and value.
              </p>
            </div>

            <div className="rules-header-icon">
              <SlidersHorizontal size={16} />
            </div>
          </div>


          <div className="rules-builder-body">

            {/* ROW 1 */}
            <div className="rules-form-grid">

              <div className="rules-field">
                <label>RULE NAME</label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="High value transaction"
                />
              </div>

              <div className="rules-field">
                <label>DESCRIPTION</label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe what this rule detects..."
                  rows={2}
                />
              </div>

            </div>


            {/* ROW 2 */}
            <div className="rules-form-grid">

              <div className="rules-field">
                <label>FIELD</label>

                <input
                  value={field}
                  onChange={(event) =>
                    setField(event.target.value)
                  }
                  placeholder="amount"
                />

                <span className="rules-help">
                  Use the column name from your uploaded CSV.
                  Example: amount, category, merchant, country.
                </span>
              </div>

              <div className="rules-field">
                <label>OPERATOR</label>

                <select
                  value={operator}
                  onChange={(event) =>
                    setOperator(event.target.value)
                  }
                >
                  {OPERATORS.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>


            {/* ROW 3 */}
            <div className="rules-form-grid">

              <div className="rules-field">
                <label>VALUE</label>

                <input
                  value={value}
                  onChange={(event) =>
                    setValue(event.target.value)
                  }
                  placeholder="10000"
                />
              </div>

              <div className="rules-field">
                <label>ACTION</label>

                <select
                  value={action}
                  onChange={(event) =>
                    setAction(event.target.value)
                  }
                >
                  {ACTIONS.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>


            {/* BOTTOM CONTROLS */}
            <div className="rules-bottom">

              <button
                type="button"
                className={`rules-enable ${
                  enabled ? 'active' : ''
                }`}
                onClick={() =>
                  setEnabled((current) => !current)
                }
              >
                <span className="rules-switch">
                  <span />
                </span>

                <span className="rules-enable-copy">
                  <strong>
                    ACTIVATE IMMEDIATELY
                  </strong>

                  <small>
                    Enabled rules can be used by the
                    rule evaluation workflow.
                  </small>
                </span>

                <span className="rules-enable-status">
                  {enabled ? 'Enabled' : 'Disabled'}
                </span>
              </button>


              <div className="rules-preview">
                <div className="rules-preview-label">
                  RULE PREVIEW
                </div>

                <code>
                  {conditionPreview}
                </code>
              </div>

            </div>


            {/* CREATE */}
            <div className="rules-create-wrap">
              <button
                type="button"
                className="rules-create"
                onClick={createRule}
                disabled={saving}
              >
                <Plus size={15} />

                {saving
                  ? 'Creating...'
                  : 'Create rule'}
              </button>
            </div>

          </div>
        </article>


        {/* =====================================================
            RULE REGISTER
            ===================================================== */}
        <article className="rules-register">

          <div className="rules-register-header">

            <div>
              <h2>
                Rule register
              </h2>

              <p>
                Saved rules for this account.
              </p>
            </div>

            <div className="rules-count">
              {rules.length}
            </div>

          </div>


          <div className="rules-list">

            {rules.length === 0 ? (
              <div className="rules-empty">
                <div className="rules-empty-icon">
                  <SlidersHorizontal size={20} />
                </div>

                <strong>
                  No rules yet
                </strong>

                <span>
                  Create your first transaction rule
                  using the builder.
                </span>
              </div>
            ) : (
              rules.map((rule) => {

                const ruleCondition =
                  Array.isArray(rule.conditions)
                    ? rule.conditions.join(' · ')
                    : String(
                        rule.condition || 'No condition'
                      );

                const ruleAction =
                  ACTIONS.find(
                    (item) =>
                      item.value === rule.action
                  )?.label ||
                  rule.action ||
                  'Flag transaction';

                return (
                  <div
                    className="rules-register-item"
                    key={rule.id || rule._id}
                  >

                    <div className="rules-register-main">

                      <div className="rules-register-title">
                        <strong>
                          {rule.name || 'Untitled rule'}
                        </strong>

                        <span
                          className={
                            rule.enabled
                              ? 'rules-badge enabled'
                              : 'rules-badge'
                          }
                        >
                          {rule.enabled
                            ? 'ENABLED'
                            : 'DISABLED'}
                        </span>
                      </div>

                      <code className="rules-register-condition">
                        {ruleCondition}
                      </code>

                      {rule.description && (
                        <p className="rules-register-description">
                          {rule.description}
                        </p>
                      )}

                      <div className="rules-register-meta">
                        Operator:{' '}
                        {selectedOperator?.label ||
                          'Configured'}
                        <span>·</span>
                        Action:{' '}
                        {ruleAction}
                      </div>

                    </div>

                    <button
                      type="button"
                      className="rules-view"
                      title="View rule"
                    >
                      <Eye size={15} />
                    </button>

                  </div>
                );
              })
            )}

          </div>

        </article>

      </div>
    </section>
  );
}