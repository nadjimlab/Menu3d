import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Flame,
  Wheat,
  Milk,
  Nut,
  Egg,
  Check,
  Plus,
  Minus,
  ChefHat,
  HeartPulse,
  Info,
} from 'lucide-react';
import { Product, CustomizationGroup, SelectedOption } from '../types';

interface ProductDetailsSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCartWithOptions: (
    product: Product,
    quantity: number,
    selectedOptions: SelectedOption[],
    specialNotes?: string
  ) => void;
  lang: 'ar' | 'en';
}

export const ProductDetailsSheet: React.FC<ProductDetailsSheetProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCartWithOptions,
  lang,
}) => {
  const isAr = lang === 'ar';
  if (!product) return null;

  // Selected options state: mapping groupId -> optionId
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    product.customizationGroups.forEach((group) => {
      if (group.required && group.options.length > 0) {
        initial[group.id] = [group.options[0].id];
      } else {
        initial[group.id] = [];
      }
    });
    return initial;
  });

  const [quantity, setQuantity] = useState<number>(1);
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);

  // Re-sync choices when product changes
  React.useEffect(() => {
    if (!product) return;
    const initial: Record<string, string[]> = {};
    product.customizationGroups.forEach((group) => {
      if (group.required && group.options.length > 0) {
        initial[group.id] = [group.options[0].id];
      } else {
        initial[group.id] = [];
      }
    });
    setSelectedChoices(initial);
    setQuantity(1);
    setSpecialNotes('');
    setRemovedIngredients([]);
  }, [product?.id]);

  const handleOptionToggle = (group: CustomizationGroup, optionId: string) => {
    if (group.required) {
      // Single select required
      setSelectedChoices((prev) => ({
        ...prev,
        [group.id]: [optionId],
      }));
    } else {
      // Multi or optional
      setSelectedChoices((prev) => {
        const current = prev[group.id] || [];
        if (current.includes(optionId)) {
          return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
        } else {
          const max = group.maxSelect || 99;
          if (current.length >= max) {
            return prev;
          }
          return { ...prev, [group.id]: [...current, optionId] };
        }
      });
    }
  };

  // Calculate options extra price
  const calculateExtraPrice = () => {
    let extra = 0;
    product.customizationGroups.forEach((group) => {
      const selectedOptionIds = selectedChoices[group.id] || [];
      selectedOptionIds.forEach((optId) => {
        const opt = group.options.find((o) => o.id === optId);
        if (opt) extra += opt.extraPrice;
      });
    });
    return extra;
  };

  const extraPricePerUnit = calculateExtraPrice();
  const unitPrice = product.price + extraPricePerUnit;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    const selectedOptionsList: SelectedOption[] = removedIngredients.map((ingredient) => ({
      groupId: 'ingredient-removals',
      groupTitle: isAr ? 'إزالة مكونات' : 'Ingredient removals',
      optionId: `without-${ingredient}`,
      optionName: isAr ? `بدون ${ingredient}` : `Without ${ingredient}`,
      extraPrice: 0,
    }));

    product.customizationGroups.forEach((group) => {
      const selectedOptionIds = selectedChoices[group.id] || [];
      selectedOptionIds.forEach((optId) => {
        const opt = group.options.find((o) => o.id === optId);
        if (opt) {
          selectedOptionsList.push({
            groupId: group.id,
            groupTitle: isAr ? group.title : group.titleEn,
            optionId: opt.id,
            optionName: isAr ? opt.name : opt.nameEn,
            extraPrice: opt.extraPrice,
          });
        }
      });
    });

    onAddToCartWithOptions(product, quantity, selectedOptionsList, specialNotes);
    onClose();
  };

  const getAllergenIcon = (allergenId: string) => {
    switch (allergenId) {
      case 'gluten':
        return <Wheat className="w-3.5 h-3.5" />;
      case 'dairy':
        return <Milk className="w-3.5 h-3.5" />;
      case 'nuts':
        return <Nut className="w-3.5 h-3.5" />;
      case 'eggs':
        return <Egg className="w-3.5 h-3.5" />;
      default:
        return <Info className="w-3.5 h-3.5" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Bottom Sheet Modal with Glassmorphism */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl max-h-[88dvh] overflow-hidden rounded-t-[32px] bg-[#121218]/90 backdrop-blur-2xl border-t border-x border-white/15 shadow-2xl flex flex-col"
          >
            {/* Grab handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-neutral-100 font-serif">
                  {isAr ? 'تفاصيل المنتج وتخصيص الطلب' : 'Product Details & Customization'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 no-scrollbar">
              {/* Product Mini Header */}
              <div className="flex items-center justify-between gap-4 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-contain rounded-xl bg-black/40 p-1"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-neutral-100">
                      {isAr ? product.name : product.nameEn}
                    </h4>
                    <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                      {product.price} {isAr ? 'دج' : 'DA'}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{product.prepTime}</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/25 text-xs font-bold">
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تحضير طازج عند الطلب' : 'Freshly prepared to order'}</span>
                </span>
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  {isAr ? 'عن هذا الطبق' : 'About This Creation'}
                </h5>
                <p className="text-xs text-neutral-300 leading-relaxed font-light">
                  {isAr ? product.fullDesc : product.fullDesc}
                </p>
              </div>

              {/* Nutritional Facts Grid */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isAr ? 'القيمة الغذائية التقريبية' : 'Nutritional Facts'}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="block text-[10px] text-neutral-400">
                      {isAr ? 'سعرات' : 'Calories'}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {product.nutrition.calories} kcal
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="block text-[10px] text-neutral-400">
                      {isAr ? 'بروتين' : 'Protein'}
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-200">
                      {product.nutrition.protein}
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="block text-[10px] text-neutral-400">
                      {isAr ? 'كاربوهيدرات' : 'Carbs'}
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-200">
                      {product.nutrition.carbs}
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                    <span className="block text-[10px] text-neutral-400">
                      {isAr ? 'دهون' : 'Fat'}
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-200">
                      {product.nutrition.fat}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ingredient controls: customers can remove any included ingredient. */}
              <div className="space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-neutral-200">
                      {isAr ? 'مكونات الطبق' : 'Ingredients'}
                    </h5>
                    <p className="mt-1 text-[10px] text-neutral-500">
                      {isAr ? 'اضغط على المكوّن لإزالته من طلبك' : 'Tap an ingredient to remove it from your order'}
                    </p>
                  </div>
                  {removedIngredients.length > 0 && (
                    <span className="rounded-full bg-rose-500/15 px-2 py-1 text-[10px] font-bold text-rose-300">
                      {removedIngredients.length} {isAr ? 'مزال' : 'removed'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {product.ingredients.map((ingredient) => {
                    const isRemoved = removedIngredients.includes(ingredient);
                    return (
                      <button
                        key={ingredient}
                        type="button"
                        onClick={() =>
                          setRemovedIngredients((current) =>
                            isRemoved
                              ? current.filter((item) => item !== ingredient)
                              : [...current, ingredient]
                          )
                        }
                        className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-start text-[11px] transition-all ${
                          isRemoved
                            ? 'border-rose-400/40 bg-rose-500/10 text-rose-200'
                            : 'border-emerald-400/20 bg-emerald-500/10 text-neutral-200 hover:border-amber-400/40'
                        }`}
                      >
                        <span className={isRemoved ? 'line-through opacity-80' : ''}>{ingredient}</span>
                        <span className="shrink-0 text-[10px] font-bold">
                          {isRemoved ? (isAr ? 'إضافة' : 'Add back') : isAr ? 'إزالة' : 'Remove'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional additions and required choices */}
              {product.customizationGroups.some((group) => !group.required) && (
                <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
                  <Plus className="h-3.5 w-3.5 text-amber-400" />
                  <span>{isAr ? 'أضف لمستك الخاصة من الخيارات المتاحة أدناه' : 'Add your personal touch from the options below'}</span>
                </div>
              )}

              {/* Allergens Notice */}
              {product.allergens.length > 0 && (
                <div className="space-y-2 bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl">
                  <span className="text-[11px] font-bold text-amber-300 block">
                    {isAr ? 'تنبيه الحساسية الغذائية:' : 'Allergen Notice:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.allergens.map((alg) => (
                      <span
                        key={alg.id}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-200 text-xs"
                      >
                        {getAllergenIcon(alg.id)}
                        <span>{isAr ? alg.name : alg.nameEn}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Customization Groups */}
              {product.customizationGroups.map((group) => {
                const selected = selectedChoices[group.id] || [];

                return (
                  <div key={group.id} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-neutral-200">
                        {isAr ? group.title : group.titleEn}
                      </h5>
                      <span className="text-[10px] text-neutral-400">
                        {group.required
                          ? isAr
                            ? 'إجباري (اختر واحداً)'
                            : 'Required'
                          : isAr
                          ? `اختياري (بحد أقصى ${group.maxSelect || 3})`
                          : 'Optional'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {group.options.map((opt) => {
                        const isOptSelected = selected.includes(opt.id);

                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleOptionToggle(group, opt.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                              isOptSelected
                                ? 'bg-amber-500/15 border-amber-500/50 text-white font-medium'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-4 h-4 rounded-${
                                  group.required ? 'full' : 'md'
                                } border flex items-center justify-center ${
                                  isOptSelected
                                    ? 'bg-amber-500 border-amber-500 text-neutral-950'
                                    : 'border-white/30 bg-transparent'
                                }`}
                              >
                                {isOptSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span>{isAr ? opt.name : opt.nameEn}</span>
                            </div>

                            {opt.extraPrice > 0 ? (
                              <span className="font-mono text-amber-400 font-bold">
                                +{opt.extraPrice} {isAr ? 'دج' : 'DA'}
                              </span>
                            ) : (
                              <span className="text-neutral-500 text-[11px]">
                                {isAr ? 'مشمل' : 'Included'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Special Chef Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">
                  {isAr ? 'ملاحظات خاصة للشيف' : 'Special Instructions for Kitchen'}
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder={
                    isAr
                      ? 'مثال: بدون سكر زائد، تسخين خفيف، صوص على الجانب...'
                      : 'E.g., light on syrup, sauce on side...'
                  }
                  rows={2}
                  className="w-full bg-white/5 focus:bg-white/10 text-xs text-neutral-200 rounded-xl p-3 border border-white/10 focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-neutral-500"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/10 bg-neutral-950/80 backdrop-blur-xl flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white disabled:opacity-40"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-mono font-bold text-sm text-neutral-100">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Confirm Add Button */}
              <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-between px-5 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all duration-200 active:scale-[0.98]"
              >
                <span>{isAr ? 'إضافة للطلب' : 'Add to Order'}</span>
                <span className="font-mono font-extrabold text-neutral-900">
                  {totalPrice} {isAr ? 'دج' : 'DA'}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
