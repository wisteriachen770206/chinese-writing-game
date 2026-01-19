# 🎮 Jeu de Calligraphie Chinoise

## 🚨 PROBLÈME DE SAUVEGARDE SUR MOBILE?

### 🧪 **TEST RAPIDE:**

1. Ouvrez ce fichier sur votre téléphone:
   ```
   test-save.html
   ```

2. Cliquez sur les boutons dans l'ordre
3. Vérifiez si vous voyez "✅ localStorage fonctionne parfaitement!"

### 📖 **GUIDE COMPLET:**

Lisez ce document:
```
docs/PROBLEME_SAUVEGARDE_MOBILE_FR.md
```

---

## ✅ Solution Rapide (90% des cas)

**Problème:** La sauvegarde ne fonctionne pas sur mobile

**Solutions les plus courantes:**

1. **🚫 Fermez le mode navigation privée**
   - Vous êtes en mode privé? → RIEN ne se sauvegarde
   - Ouvrez un nouvel onglet normal

2. **🍪 Autorisez les cookies**
   - iPhone: Réglages → Safari → "Bloquer tous les cookies" = DÉSACTIVÉ
   - Android: Chrome → Paramètres → Cookies → Autoriser

3. **📱 Utilisez le bon navigateur**
   - iPhone/iPad: Utilisez **Safari** (pas Chrome)
   - Android: Utilisez **Chrome**

4. **💾 Vérifiez l'espace**
   - Si "Storage full" → Effacez le cache du navigateur

---

## 🎯 Comment savoir que ça marche?

Après avoir terminé un niveau:

✅ Vous voyez: "**✅ Progress auto-saved!**"  
✅ Une carte "**📍 Continue**" apparaît dans la sélection de niveau  
✅ Si vous fermez et rouvrez, vos progrès sont là  

---

## 🆘 Besoin d'aide?

1. Testez avec `test-save.html`
2. Lisez `docs/PROBLEME_SAUVEGARDE_MOBILE_FR.md`
3. Prenez une capture d'écran des erreurs
4. Notez votre modèle de téléphone et navigateur

---

## 📂 Fichiers Utiles

- `test-save.html` - Page de test de sauvegarde
- `docs/PROBLEME_SAUVEGARDE_MOBILE_FR.md` - Guide complet en français
- `docs/MOBILE_SAVE_TROUBLESHOOTING.md` - Guide en anglais
- `DEPLOY_INSTRUCTIONS.md` - Instructions de déploiement

---

## 🎮 Jouer au Jeu

1. Ouvrez `index.html` dans votre navigateur
2. Ou visitez la version en ligne sur GitHub Pages
3. Sélectionnez un niveau
4. Tracez les caractères en suivant les traits

**La sauvegarde est automatique!** Pas besoin de cliquer sur "Sauvegarder".

---

## 🔧 Mode Debug

Pour voir les logs de débogage dans la console:

1. Sur Android: Chrome → Menu (⋮) → Plus d'outils → Outils de développement
2. Sur iOS (desktop): Safari → Développement → Inspecteur web
3. Cherchez les messages commençant par 🔵 ou ✅ ou ❌

Les logs vous diront exactement ce qui se passe lors de la sauvegarde.

---

## ⚡ Démarrage Rapide

```bash
# Lancer un serveur local
python -m http.server 8000

# Ouvrir dans le navigateur
http://localhost:8000
```

**Sur mobile:** Utilisez l'adresse IP de votre ordinateur au lieu de localhost.

---

## 📝 Notes Importantes

- **Mode privé:** Ne sauvegarde JAMAIS (c'est normal)
- **Cookies bloqués:** Empêchent la sauvegarde
- **Cache plein:** Videz le cache si erreur "Storage full"
- **iOS:** Safari fonctionne mieux que Chrome
- **Android:** Chrome fonctionne très bien

---

## ✨ Fonctionnalités

- ✅ Sauvegarde automatique des progrès
- ✅ Plusieurs niveaux de difficulté
- ✅ Système de points de vie (HP)
- ✅ Chronomètre
- ✅ Détection de la direction des traits
- ✅ Support mobile et desktop
- ✅ Mode hors ligne (aucune connexion requise)

---

**Bon jeu! 🎉**
