import { useState } from 'react';
import { Check, Crown, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '₹299',
    suffix: '/mo',
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '₹2,499',
    suffix: '/yr',
    featured: true,
  },
  {
    id: 'student',
    name: 'Student',
    price: '₹149',
    suffix: '/mo',
  },
];

const features = [
  'Advanced stock research',
  'Multi-period price history',
  'Technical context and signals',
  'Premium screen templates',
  'Portfolio analytics',
  'Expanded analysis exports',
];

export default function PremiumModal({ open, onClose }) {
  const { currentUser, upgradeToPremium } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const choosePlan = async (plan) => {
    if (busy) return;

    setSelectedPlan(plan.id);
    setBusy(true);

    try {
      await upgradeToPremium();

      toast.success(`${plan.name} FintelPlus activated.`);

      setBusy(false);
      setSelectedPlan(null);
      onClose();
    } catch (error) {
      console.error('FintelPlus upgrade failed:', error);

      toast.error(
        error?.message || 'Unable to activate FintelPlus.'
      );

      setBusy(false);
      setSelectedPlan(null);
    }
  };

  const closeModal = () => {
    if (busy) return;
    onClose();
  };

  return (
    <div
      className="modal-layer premium-modal-layer"
      onMouseDown={closeModal}
    >
      <div
        className="modal premium-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="modal-head">
          <div>
            <p className="page-kicker premium-kicker">
              <Crown
                size={12}
                style={{
                  display: 'inline',
                  verticalAlign: '-2px',
                  marginRight: 5,
                }}
              />
              FINTELPLUS
            </p>

            <h2 id="premium-title">
              {currentUser?.isPremium
                ? 'Premium access'
                : 'Upgrade to FintelPlus'}
            </h2>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={closeModal}
            disabled={busy}
            aria-label="Close premium modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body premium-modal-body">
          <p className="premium-description">
            Premium adds deeper market research and enhanced
            financial-analysis tools to the same workspace.
          </p>

          {/* PLANS */}
          <div className="premium-grid">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;

              return (
                <div
                  className={`plan ${
                    plan.featured ? 'featured' : ''
                  }`}
                  key={plan.id}
                >
                  {plan.featured && (
                    <div className="premium-recommended">
                      RECOMMENDED
                    </div>
                  )}

                  <div className="plan-name">
                    {plan.name}
                  </div>

                  <div className="plan-price">
                    {plan.price}
                    <span>{plan.suffix}</span>
                  </div>

                  <button
                    type="button"
                    className={`btn btn-primary premium-choose-btn ${
                      isSelected ? 'is-loading' : ''
                    }`}
                    onClick={(event) => {
                      event.stopPropagation();
                      choosePlan(plan);
                    }}
                    disabled={busy}
                  >
                    {isSelected ? (
                      <>
                        <Loader2
                          size={14}
                          className="premium-spinner"
                        />
                        Activating…
                      </>
                    ) : (
                      'Choose'
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* FEATURES */}
          <div className="premium-feature-list">
            {features.map((feature) => (
              <div
                className="feature-line"
                key={feature}
              >
                <Check
                  size={13}
                  className="text-positive"
                />

                <span>{feature}</span>
              </div>
            ))}
          </div>

          {busy && (
            <div className="premium-processing">
              <Loader2
                size={13}
                className="premium-spinner"
              />

              <span>
                Activating your FintelPlus access…
              </span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-foot">
          <button
            type="button"
            className="btn"
            onClick={closeModal}
            disabled={busy}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}